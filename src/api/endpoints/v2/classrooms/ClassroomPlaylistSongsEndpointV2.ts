import { Request } from "express";
import Classroom from "../../../../data/classrooms/Classroom";
import ClassroomSong from "../../../../data/classrooms/ClassroomSong";
import { deleteSong, getSongsAsClassSongs } from "../../../../data/extensions/ClassroomPlaylistV2Extensions";
import { isInClassCode } from "../../../../data/extensions/UserExtensions";
import Role from "../../../../data/users/Role";
import APIEndpoint from "../../../../mvc/api/APIEndpoint";
import APIRoute from "../../../../mvc/api/APIRoute";
import RequestMethod from "../../../../mvc/requests/RequestMethod";
import APIController from "../../../APIController";
import MoveClassroomSongRequest from "../../../requests/MoveClassroomSongRequest";
import APIResponse from "../../../responses/APIResponse";
import { assertContentIsJSON, assertJSONBodyFieldIsNumber, assertJSONBodyFieldIsString } from "../../EndpointAssert";
import { i32 as int } from "typed-numbers";
import AddClassroomSongRequest from "../../../requests/AddClassroomSongRequest";
import SongSource from "../../../../data/playlists/SongSource";
import SongToAdd from "../../../../data/classrooms/SongToAdd";
import RemoveClassroomSongResponse from "../../../responses/RemoveClassroomSongResponse";
import RemoveClassroomSongRequest from "../../../requests/RemoveClassroomSongRequest";
import ClassroomSongV2 from "../../../../data/classrooms/ClassroomSongV2";
import ClassroomV2 from "../../../../data/classrooms/ClassroomV2";
import RemoveClassroomSongResponseV2 from "../../../responses/RemoveClassroomSongResponseV2";

class GetRoute extends APIRoute<ClassroomSongV2[], ClassroomPlaylistSongsEndpointV2> {
    public constructor(endpoint: ClassroomPlaylistSongsEndpointV2) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSongV2[]>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let session = sessionInfo.session;
        let code = req.params.code;

        let userInfo = await this.getUserFromSession(session);
        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;
        if (!isInClassCode(user, code)) {
            return this.fail("api.classroom.not_found", {});
        }

        let classroom: ClassroomV2;
        try {
            classroom = await this.server.db.classroomsV2.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        if (user.type === Role.Student && !classroom.settings.playlistVisible) {
            return this.fail("api.classroom.playlist.hidden", {});
        }

        console.log(JSON.stringify(classroom, undefined, 4));

        let songs = getSongsAsClassSongs(classroom.playlist, user.type, user.email);
        return this.success(songs);
    }
} 

/*
class PutRoute extends APIRoute<ClassroomSong[], ClassroomPlaylistSongsEndpointV2> {
    public constructor(endpoint: ClassroomPlaylistSongsEndpointV2) {
        super(endpoint, RequestMethod.PUT);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSong[]>> {
        let failResponse = assertContentIsJSON(this, req) ??
            assertJSONBodyFieldIsNumber(this, req, "/old_index") ??
            assertJSONBodyFieldIsNumber(this, req, "/new_index");

        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as MoveClassroomSongRequest;
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let session = sessionInfo.session;
        let code = req.params.code;

        let userInfo = await this.getUserFromSession(session);
        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;
        if (user.type !== Role.Teacher) {
            return this.fail("api.restrictions.teachers", {});
        }

        if (!isInClassCode(user, code)) {
            return this.fail("api.classroom.not_found", {});
        }

        let classroom: Classroom;
        try {
            classroom = await this.server.db.classrooms.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        try {
            let songs = await moveSong(classroom.playlist, this.server.db.playlists, classroom.owner, int(body.oldIndex), int(body.newIndex));

            return this.success(songs);
        }
        catch(err) {
            this.logger.debug("Caught exception from moving songs: " + err);
            return this.fail("api.classroom.playlist.song.move.fail", {});
        }
    }
} 
*/
class PostRoute extends APIRoute<ClassroomSongV2[] | null, ClassroomPlaylistSongsEndpointV2> {
    public constructor(endpoint: ClassroomPlaylistSongsEndpointV2) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSongV2[] | null>> {
        let failResponse = assertContentIsJSON(this, req) ??
            assertJSONBodyFieldIsString(this, req, "/id") ??
            assertJSONBodyFieldIsString(this, req, "/source");
        
        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as AddClassroomSongRequest;

        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let session = sessionInfo.session;
        let code = req.params.code;

        if (body.source !== SongSource.youtube) {
            return this.fail("api.classroom.playlist.song.invalid_source", { "source": body.source });
        }

        let userInfo = await this.getUserFromSession(session);
        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;
        if (!isInClassCode(user, code)) {
            return this.fail("api.classroom.not_found", {});
        }

        let classroom: ClassroomV2;
        try {
            classroom = await this.server.db.classroomsV2.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        let songToAdd: SongToAdd = {
            "id": body.id,
            "source": body.source,
            "title": "",
            "requested_by": {
                "email": user.email,
                "name": user.name
            }
        };

        let exists = classroom.playlist.priority.some((s) => s.id === songToAdd.id && s.source === songToAdd.source) ||
            classroom.playlist.songs.some((s) => s.id === songToAdd.id && s.source === songToAdd.source);

        if (exists) {
            return this.fail("api.classroom.playlist.song.add.exists", {});
        }

        let displayResults = true;
        if (user.type === Role.Student) {
            if (!classroom.settings.allowSongSubmissions) {
                return this.fail("api.classroom.submissions.disabled", {});
            }
            if (classroom.settings.submissionsRequireTokens) {
                let studentIndex = -1;
                for (let index = 0; index < classroom.students.length; index++) {
                    if (classroom.students[index].email === user.email) {
                        studentIndex = index;
                        break;
                    }
                }

                if (studentIndex === -1) {
                    this.logger.warn("Student attempted to submit song, and yet they are still in the classroom for the userdb, but not in the roster in the classroomdb");
                    return this.fail("api.server", {});
                }

                try {
                    songToAdd.title = await this.server.fetchTitleForSong(songToAdd.id, songToAdd.source);
                }
                catch {
                    return this.fail("api.classroom.playlist.song.not_found", {});
                }

                // todo: implement support for custom token costs
                let submissionCost = 1;
                let student = classroom.students[studentIndex];

                if (student.tokens < submissionCost) {
                    return this.fail("api.classroom.submissions.tokens", {});
                }

                student.tokens = int(student.tokens - submissionCost);

                await this.server.db.classroomsV2.set(code, classroom);
            }

            if (!classroom.settings.playlistVisible) {
                displayResults = false;
            }
        }

        if (songToAdd.title.length === 0) {
            try {
                songToAdd.title = await this.server.fetchTitleForSong(songToAdd.id, songToAdd.source);
            }
            catch {
                return this.fail("api.classroom.playlist.song.not_found", {});
            }
        } 

        try {
            classroom.playlist.songs.push({
                "id": songToAdd.id,
                "source": songToAdd.source,
                "title": songToAdd.title,
                "likes": [],
                "requested_by": songToAdd.requested_by
            });
            await this.server.db.classroomsV2.set(code, classroom);

            if (displayResults) {
                return this.success(getSongsAsClassSongs(classroom.playlist, user.type, user.email));
            }
            
            return this.success([]);
        }
        catch(err) {
            return this.fail("api.classroom.playlist.song.add.fail", {});
        }
    }
} 
class DeleteRoute extends APIRoute<RemoveClassroomSongResponseV2, ClassroomPlaylistSongsEndpointV2> {
    public constructor(endpoint: ClassroomPlaylistSongsEndpointV2) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<RemoveClassroomSongResponseV2>> {
        let failResponse = assertContentIsJSON(this, req) ??
            assertJSONBodyFieldIsNumber(this, req, "/index");

        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as RemoveClassroomSongRequest;
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let session = sessionInfo.session;
        let code = req.params.code;

        let userInfo = await this.getUserFromSession(session);
        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;

        if (user.type !== Role.Teacher) {
            return this.fail("api.restrictions.teachers", {});
        }

        if (!isInClassCode(user, code)) {
            return this.fail("api.classroom.not_found", {});
        }

        let classroom: ClassroomV2;
        try {
            classroom = await this.server.db.classroomsV2.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        deleteSong(classroom.playlist, body.index);
        await this.server.db.classroomsV2.set(code, classroom);
        return this.success({
            "songs": getSongsAsClassSongs(classroom.playlist, user.type, user.email),
            "currentSong": classroom.playlist.currentSong
        });
    }
} 

// todo: reimplement Put Route

export default class ClassroomPlaylistSongsEndpointV2 extends APIEndpoint {

    private readonly _get: GetRoute;
    //private readonly _put: PutRoute;
    private readonly _post: PostRoute;
    private readonly _delete: DeleteRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/songs", "classroom-playlist-songs", 2);

        this._get = new GetRoute(this);
        //this._put = new PutRoute(this);
        this._post = new PostRoute(this);
        this._delete = new DeleteRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        //this.addRoute(this._put);
        this.addRoute(this._post);
        this.addRoute(this._delete);
    }
}
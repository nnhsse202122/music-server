import { Request } from "express";
import Classroom from "../../../data/classrooms/Classroom";
import ClassroomSong from "../../../data/classrooms/ClassroomSong";
import { addSong, deleteSong, getSongs, getSongsAsClassSongs, moveSong } from "../../../data/extensions/ClassroomPlaylistExtensions";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import MoveClassroomSongRequest from "../../requests/MoveClassroomSongRequest";
import APIResponse from "../../responses/APIResponse";
import { assertContentIsJSON, assertJSONBodyFieldIsNumber, assertJSONBodyFieldIsString } from "../EndpointAssert";
import { i32 as int } from "typed-numbers";
import AddClassroomSongRequest from "../../requests/AddClassroomSongRequest";
import SongSource from "../../../data/playlists/SongSource";
import SongToAdd from "../../../data/classrooms/SongToAdd";
import RemoveClassroomSongResponse from "../../responses/RemoveClassroomSongResponse";
import RemoveClassroomSongRequest from "../../requests/RemoveClassroomSongRequest";

class GetRoute extends APIRoute<ClassroomSong[], ClassroomPlaylistSongsEndpoint> {
    public constructor(endpoint: ClassroomPlaylistSongsEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSong[]>> {
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

        let classroom: Classroom;
        try {
            classroom = await this.server.db.classrooms.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        if (user.type === Role.Student && !classroom.settings.playlistVisible) {
            return this.fail("api.classroom.playlist.hidden", {});
        }

        let songs = await getSongsAsClassSongs(classroom.playlist, this.server.db.playlists, classroom.owner, user.type);
        return this.success(songs);
    }
} 
class PutRoute extends APIRoute<ClassroomSong[], ClassroomPlaylistSongsEndpoint> {
    public constructor(endpoint: ClassroomPlaylistSongsEndpoint) {
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
class PostRoute extends APIRoute<ClassroomSong[] | null, ClassroomPlaylistSongsEndpoint> {
    public constructor(endpoint: ClassroomPlaylistSongsEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSong[] | null>> {
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

        let classroom: Classroom;
        try {
            classroom = await this.server.db.classrooms.get(code);
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

        let songs = await getSongsAsClassSongs(classroom.playlist, this.server.db.playlists, classroom.owner, Role.Student);
        if (songs.some((s) => {
            return s.id === songToAdd.id && s.source == songToAdd.source
        })) {
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

                await this.server.db.classrooms.set(code, classroom);
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
            let songs = await addSong(classroom.playlist, this.server.db.playlists, classroom.owner, songToAdd, int(-1), user.type);
            await this.server.db.classrooms.set(code, classroom);
            return this.success(displayResults ? songs : null);
        }
        catch(err) {
            return this.fail("api.classroom.playlist.song.add.fail", {});
        }
    }
} 
class DeleteRoute extends APIRoute<RemoveClassroomSongResponse, ClassroomPlaylistSongsEndpoint> {
    public constructor(endpoint: ClassroomPlaylistSongsEndpoint) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<RemoveClassroomSongResponse>> {
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

        let classroom: Classroom;
        try {
            classroom = await this.server.db.classrooms.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        let songs = await deleteSong(classroom.playlist, this.server.db.playlists, classroom.owner, int(body.index));
        await this.server.db.classrooms.set(code, classroom);
        return this.success({
            "songs": songs,
            "songPosition": classroom.playlist.currentSongPosition
        });
    }
} 

export default class ClassroomPlaylistSongsEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _put: PutRoute;
    private readonly _post: PostRoute;
    private readonly _delete: DeleteRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/songs", "classroom-playlist-songs", 1);

        this._get = new GetRoute(this);
        this._put = new PutRoute(this);
        this._post = new PostRoute(this);
        this._delete = new DeleteRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._put);
        this.addRoute(this._post);
        this.addRoute(this._delete);
    }
}
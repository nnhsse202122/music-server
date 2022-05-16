import { Request } from "express";
import Classroom from "../../../data/classrooms/Classroom";
import ClassroomSongV2 from "../../../data/classrooms/ClassroomSongV2";
import ClassroomV2 from "../../../data/classrooms/ClassroomV2";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import SetClassroomPlaylistRequest from "../../requests/SetClassroomPlaylistRequest";
import APIResponse from "../../responses/APIResponse";
import ClassroomPlaylistResponse from "../../responses/ClassroomPlaylistResponse";
import { i32 as int } from "typed-numbers";
import SongTeacherViewV2 from "../../../data/classrooms/SongTeacherViewV2";
import { assertContentIsJSON, assertJSONBodyFieldIsNumber } from "../EndpointAssert";
import SetCurrentSongRequest from "../../requests/SetCurrentSongRequest";

class GetRoute extends APIRoute<ClassroomSongV2, ClassroomPlaylistCurrentSongEndpoint> {

    public constructor(endpoint: ClassroomPlaylistCurrentSongEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSongV2>> {
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
            return this.fail("api.classroom.playlist.hidden", { });
        }

        let currentSongRef = classroom.playlist.currentSong;
        let currentSong = currentSongRef.fromPriority ? classroom.playlist.priority[0] : classroom.playlist.songs[currentSongRef.index];
        if (currentSong == null) {
            return this.fail("api.classroom.playlist.current_song.none", { });
        }

        if (user.type === Role.Student) {
            return this.success({
                "from_priority": currentSongRef.fromPriority,
                "id": currentSong.id,
                "source": currentSong.source,
                "title": currentSong.title,
                "position": int(currentSongRef.index + 1),
                "is_liked": currentSong.likes.includes(user.email),
                "likes": undefined,
                "requested_by": undefined
            });
        }
        else {
            return this.success({
                "from_priority": currentSongRef.fromPriority,
                "id": currentSong.id,
                "source": currentSong.source,
                "title": currentSong.title,
                "position": int(currentSongRef.index + 1),
                "is_liked": undefined,
                "likes": int(currentSong.likes.length),
                "requested_by": {
                    "email": currentSong.requested_by.email,
                    "name": currentSong.requested_by.name
                }
            });
        }
    }
}

class PostRoute extends APIRoute<ClassroomSongV2, ClassroomPlaylistCurrentSongEndpoint> {

    public constructor(endpoint: ClassroomPlaylistCurrentSongEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSongV2>> {
        let failResponse = assertContentIsJSON(this, req) ??
            assertJSONBodyFieldIsNumber(this, req, "/index");
        
        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as SetCurrentSongRequest;

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

        if (body.index < 0 || body.index >= classroom.playlist.songs.length) {
            return this.fail("api.body.field.number", {});
        }

        if (classroom.playlist.currentSong.fromPriority) {
            classroom.playlist.priority.splice(0, 1);
        }

        classroom.playlist.currentSong = {
            "fromPriority": false,
            "index": int(body.index)
        };

        await this.server.db.classroomsV2.set(code, classroom);
        let currentSong: SongTeacherViewV2;
        let s = classroom.playlist.songs[classroom.playlist.currentSong.index];
        currentSong = {
            "from_priority": false,
            "id": s.id,
            "is_liked": undefined,
            "position": int(classroom.playlist.currentSong.index + 1),
            "title": s.title,
            "likes": int(s.likes.length),
            "source": s.source,
            "requested_by": {
                "email": s.requested_by.email,
                "name": s.requested_by.name
            }
        };
        return this.success(currentSong);
    }
}

export default class ClassroomPlaylistCurrentSongEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/current-song", "classroom-playlist", 2);

        this._get = new GetRoute(this);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._post);
    }
}
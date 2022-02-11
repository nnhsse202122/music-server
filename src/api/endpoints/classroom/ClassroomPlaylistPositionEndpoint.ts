import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import APIController from "../../APIController";
import { i32 as int } from "typed-numbers";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import { Request } from "express";
import APIResponse from "../../responses/APIResponse";
import Role from "../../../data/users/Role";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Classroom from "../../../data/classrooms/Classroom";
import { assertContentIsJSON, assertJSONBodyFieldIsNumber, assertJSONBodyIsntNull } from "../EndpointAssert";
import SetClassroomSongPositionRequest from "../../requests/SetClassroomSongPositionRequest";
import { getSongCount } from "../../../data/extensions/ClassroomPlaylistExtensions";

class PostRoute extends APIRoute<int, ClassroomPlaylistPositionEndpoint> {
    public constructor(endpoint: ClassroomPlaylistPositionEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<int>> {
        let failResponse = assertContentIsJSON(this, req) ?? 
            assertJSONBodyIsntNull(this, req) ??
            assertJSONBodyFieldIsNumber(this, req, "/position");

        if (failResponse !== null) {
            return failResponse;
        }

        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let session = sessionInfo.session;
        let code = req.params.code;
        let body = req.body as SetClassroomSongPositionRequest;

        let userInfo = await this.getUserFromSession(session);
        if (!userInfo.verified) {
            return userInfo.response;
        }
        let user = userInfo.user;

        let position = int(body.position);

        if (user.type !== Role.Teacher) {
            return this.fail("api.restrictions.teachers", {});
        }

        let classroom: Classroom;
        try {
            classroom = await this.server.db.classrooms.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        let maxSongs = await getSongCount(classroom.playlist, this.server.db.playlists, classroom.owner);
        if (position >= maxSongs) {
            position = int(Math.min(position - maxSongs, maxSongs - 1));
        }
        if (position < 0) {
            position = int(Math.max(position + maxSongs, 0));
        }

        classroom.playlist.currentSongPosition = position;

        await this.server.db.classrooms.set(code, classroom);
        return this.success(classroom.playlist.currentSongPosition);
    }
}

class GetRoute extends APIRoute<int, ClassroomPlaylistPositionEndpoint> {

    public constructor(endpoint: ClassroomPlaylistPositionEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<int>> {
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
            return this.fail("api.classroom.not_found", {})
        }

        let classroom: Classroom;
        try {
            classroom = await this.server.db.classrooms.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        return this.success(classroom.playlist.currentSongPosition);
    }
}

export default class ClassroomPlaylistPositionEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/position", "classroom-playlist-position", 1);

        this._get = new GetRoute(this);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._post);
    }
}
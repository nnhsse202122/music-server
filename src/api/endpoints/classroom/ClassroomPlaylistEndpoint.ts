import { Request } from "express";
import Classroom from "../../../data/classrooms/Classroom";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import SetClassroomPlaylistRequest from "../../requests/SetClassroomPlaylistRequest";
import APIResponse from "../../responses/APIResponse";
import ClassroomPlaylistResponse from "../../responses/ClassroomPlaylistResponse";
import { assertContentIsJSON, assertJSONBodyFieldIsString, assertJSONBodyIsntNull } from "../EndpointAssert";

class GetRoute extends APIRoute<ClassroomPlaylistResponse, ClassroomPlaylistEndpoint> {

    public constructor(endpoint: ClassroomPlaylistEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomPlaylistResponse>> {
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

        return this.success({
            "modifications": [...classroom.playlist.modifications],
            "playlist": classroom.playlist.playlist
        });
    }
}

class PostRoute extends APIRoute<ClassroomPlaylistResponse, ClassroomPlaylistEndpoint> {

    public constructor(endpoint: ClassroomPlaylistEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomPlaylistResponse>> {
        let failResponse = assertContentIsJSON(this, req) ??
            assertJSONBodyIsntNull(this, req) ??
            assertJSONBodyFieldIsString(this, req, "/playlist_owner") ??
            assertJSONBodyFieldIsString(this, req, "/playlist_id");

        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as SetClassroomPlaylistRequest;

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

        let canAccessPlaylist = await this.server.db.playlists.canAccess(user.email, body.playlist_owner, body.playlist_id);
        if (canAccessPlaylist) {
            return this.fail("api.playlist.not_found", {});
        }

        // TODO: Bring this up next sprint planning how this should work to the product owner with old playlists and using a new playlist.

        classroom.playlist.playlist = {
            "id": body.playlist_id,
            "owner": body.playlist_owner
        };

        return this.success({
            "modifications": [...classroom.playlist.modifications],
            "playlist": classroom.playlist.playlist
        });
    }
}

class DeleteRoute extends APIRoute<ClassroomPlaylistResponse, ClassroomPlaylistEndpoint> {

    public constructor(endpoint: ClassroomPlaylistEndpoint) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomPlaylistResponse>> {
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

        // TODO: Generate a list of modifications that contain what the playlist originally looked like.
        //       This way there won't be skill issues of songs being consumed.
        //       Actually we should bring this up next sprint planning because product owner may want something different.

        classroom.playlist.playlist = null;
        await this.server.db.classrooms.set(code, classroom);

        return this.success({
            "modifications": [...classroom.playlist.modifications],
            "playlist": classroom.playlist.playlist
        });
    }
}


export default class ClassroomPlaylistEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _delete: DeleteRoute;
    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist", "classroom-playlist", 1);

        this._get = new GetRoute(this);
        this._delete = new DeleteRoute(this);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
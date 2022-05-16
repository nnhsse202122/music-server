import { Request } from "express";
import Classroom from "../../../data/classrooms/Classroom";
import ClassroomSong from "../../../data/classrooms/ClassroomSong";
import { shuffleSongs } from "../../../data/extensions/ClassroomPlaylistExtensions";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import APIResponse from "../../responses/APIResponse";


class PostRoute extends APIRoute<ClassroomSong[], ClassroomPlaylistShuffleEndpoint> {
    public constructor(endpoint: ClassroomPlaylistShuffleEndpoint) {
        super(endpoint, RequestMethod.POST);
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

        let classroomPlaylist = classroom.playlist;
        let result = await shuffleSongs(classroomPlaylist, this.server.db.playlists, classroom.owner);
        await this.server.db.classrooms.set(code, classroom);
        return this.success(result);
    }
}

export default class ClassroomPlaylistShuffleEndpoint extends APIEndpoint {

    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/shuffle", "classroom-playlist-shuffle", 1);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._post);
    }

}
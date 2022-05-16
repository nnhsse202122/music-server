import { Request } from "express";
import ClassroomSongV2 from "../../../data/classrooms/ClassroomSongV2";
import ClassroomV2 from "../../../data/classrooms/ClassroomV2";
import { shuffleSongsV2 } from "../../../data/extensions/ClassroomPlaylistExtensions";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import APIResponse from "../../responses/APIResponse";
import { i32 as int } from "typed-numbers";


class PostRoute extends APIRoute<ClassroomSongV2[], ClassroomPlaylistShuffleEndpointV2> {
    public constructor(endpoint: ClassroomPlaylistShuffleEndpointV2) {
        super(endpoint, RequestMethod.POST);
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

        let classroomPlaylist = classroom.playlist;
        shuffleSongsV2(classroomPlaylist);
        await this.server.db.classroomsV2.set(code, classroom);
        return this.success(classroom.playlist.songs.map((song, index) => {
            return {
                "id": song.id,
                "title": song.title,
                "source": song.source,
                "is_liked": undefined,
                "likes": int(song.likes.length),
                "requested_by": {
                    "email": song.requested_by.email,
                    "name": song.requested_by.name,
                },
                "from_priority": false,
                "position": int(index + 1)
            };
        }));
    }
}

export default class ClassroomPlaylistShuffleEndpointV2 extends APIEndpoint {

    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/shuffle", "classroom-playlist-shuffle", 2);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._post);
    }

}
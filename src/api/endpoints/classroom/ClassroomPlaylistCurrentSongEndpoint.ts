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

        if (user.type === Role.Student) {
            return this.success({
                "from_priority": currentSongRef.fromPriority,
                "id": currentSong.id,
                "source": currentSong.source,
                "title": currentSong.title,
                "position": int(currentSongRef.index + 1),
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
                "requested_by": {
                    "email": currentSong.requested_by.email,
                    "name": currentSong.requested_by.name
                }
            });
        }
    }
}


export default class ClassroomPlaylistCurrentSongEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/current-song", "classroom-playlist", 2);

        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
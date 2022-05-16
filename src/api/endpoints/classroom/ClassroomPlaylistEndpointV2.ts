import { Request } from "express";
import Classroom from "../../../data/classrooms/Classroom";
import ClassroomV2 from "../../../data/classrooms/ClassroomV2";
import SongTeacherView from "../../../data/classrooms/SongTeacherView";
import SongTeacherViewV2 from "../../../data/classrooms/SongTeacherViewV2";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import SetClassroomPlaylistRequest from "../../requests/SetClassroomPlaylistRequest";
import APIResponse from "../../responses/APIResponse";
import ClassroomPlaylistResponse from "../../responses/ClassroomPlaylistResponse";
import ClassroomPlaylistResponseV2 from "../../responses/ClassroomPlaylistResponseV2";
import { assertContentIsJSON, assertJSONBodyFieldIsString, assertJSONBodyIsntNull } from "../EndpointAssert";
import { i32 as int } from "typed-numbers";

class GetRoute extends APIRoute<ClassroomPlaylistResponseV2, ClassroomPlaylistEndpointV2> {

    public constructor(endpoint: ClassroomPlaylistEndpointV2) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomPlaylistResponseV2>> {
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

        let currentSong: SongTeacherViewV2;
        if (classroom.playlist.currentSong.fromPriority) {
            let s = classroom.playlist.priority[0];
            currentSong = {
                "from_priority": true,
                "id": s.id,
                "position": int(classroom.playlist.currentSong.index + 1),
                "title": s.title,
                "source": s.source,
                "likes": int(s.likes.length),
                "is_liked": undefined,
                "requested_by": {
                    "email": s.requested_by.email,
                    "name": s.requested_by.name
                }
            };
        }
        else {
            let s = classroom.playlist.songs[classroom.playlist.currentSong.index];
            currentSong = {
                "from_priority": false,
                "id": s.id,
                "position": int(classroom.playlist.currentSong.index + 1),
                "title": s.title,
                "is_liked": undefined,
                "likes": int(s.likes.length),
                "source": s.source,
                "requested_by": {
                    "email": s.requested_by.email,
                    "name": s.requested_by.name
                }
            };
        }

        return this.success({
            "currentSong": currentSong,
            "songs": classroom.playlist.songs.map((song, index) => {
                return {
                    "id": song.id,
                    "title": song.title,
                    "source": song.source,
                    "requested_by": {
                        "name": song.requested_by.name,
                        "email": song.requested_by.email
                    },
                    "likes": int(song.likes.length),
                    "is_liked": undefined,
                    "from_priority": false,
                    "position": int(index + 1)
                };
            })
        });
    }
}

class DeleteRoute extends APIRoute<ClassroomPlaylistResponseV2, ClassroomPlaylistEndpointV2> {

    public constructor(endpoint: ClassroomPlaylistEndpointV2) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomPlaylistResponseV2>> {
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

        await this.server.db.classroomsV2.set(code, classroom);

        // @ts-ignore
        return this.fail("", {});
        // return this.success({
        //     ""
        // });
    }
}


export default class ClassroomPlaylistEndpointV2 extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _delete: DeleteRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist", "classroom-playlist", 2);

        this._get = new GetRoute(this);
        this._delete = new DeleteRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._delete);
    }
}
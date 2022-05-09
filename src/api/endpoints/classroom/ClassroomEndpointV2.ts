import { Request } from "express";
import { isInClassCode, isInClassV2 } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import APIResponse from "../../responses/APIResponse";
import GottenClassroom from "../../responses/GottenClassroom";
import GottenClassroomAsOutsider from "../../responses/GottenClassroomAsOutsider";
import GottenClassroomAsStudent from "../../responses/GottenClassroomAsStudent";
import GottenClassroomAsTeacher from "../../responses/GottenClassroomAsTeacher";
import { i32 as int } from "typed-numbers";
import User from "../../../data/users/User";
import { removeAllStudents, removeStudent } from "../../../data/extensions/ClassroomV2Extensions";
import ClassroomV2 from "../../../data/classrooms/ClassroomV2";


class GetRoute extends APIRoute<GottenClassroom, ClassroomEndpointV2> {
    public constructor(endpoint: ClassroomEndpointV2) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<GottenClassroom>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let session = sessionInfo.session;
        let userInfo = await this.getUserFromSession(session);

        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;
        let classroom: ClassroomV2;
        try {
            classroom = await this.server.db.classroomsV2.get(req.params.code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        let inClass = isInClassV2(user, classroom);
        if (!inClass) {
            if (user.type != Role.Teacher) return this.fail("api.classroom.not_found", {});

            let gottenClassroom: GottenClassroomAsOutsider = {
                "code": classroom.code,
                "name": classroom.name,
                "settings": {
                    "allow_submissions": classroom.settings.allowSongSubmissions,
                    "joinable": classroom.settings.joinable,
                    "playlist_visible": classroom.settings.playlistVisible,
                    "submissions_require_tokens": classroom.settings.submissionsRequireTokens
                }
            }
            return this.success(gottenClassroom);
        }

        if (user.type == Role.Teacher) {
            let gottenClassroom: GottenClassroomAsTeacher = {
                "code": classroom.code,
                "name": classroom.name,
                "settings": {
                    "allow_submissions": classroom.settings.allowSongSubmissions,
                    "joinable": classroom.settings.joinable,
                    "playlist_visible": classroom.settings.playlistVisible,
                    "submissions_require_tokens": classroom.settings.submissionsRequireTokens
                },
                "students": [...classroom.students]
            }
            return this.success(gottenClassroom);
        }
        else {
            let gottenClassroom: GottenClassroomAsStudent = {
                "code": classroom.code,
                "name": classroom.name,
                "settings": {
                    "allow_submissions": classroom.settings.allowSongSubmissions,
                    "joinable": classroom.settings.joinable,
                    "playlist_visible": classroom.settings.playlistVisible,
                    "submissions_require_tokens": classroom.settings.submissionsRequireTokens
                },
                "tokens": int(classroom.students.find((s) => s.email === user.email)?.tokens ?? 0)
            }
            return this.success(gottenClassroom);
        }
    }
}

class DeleteRoute extends APIRoute<boolean, ClassroomEndpointV2> {
    public constructor(endpoint: ClassroomEndpointV2) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<boolean>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let session = sessionInfo.session;
        let userInfo = await this.getUserFromSession(session);
        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user: User = userInfo.user;
        let code = req.params.code;
        let inClass = isInClassCode(user, code);

        if (!inClass) {
            return this.fail("api.classroom.not_found", {});
        }

        let classroom: ClassroomV2;
        try {
            classroom = await this.server.db.classroomsV2.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        if (user.type === Role.Student) {
            let removedStudentInfo = await removeStudent(classroom, this.server.db.classroomsV2, this.server.db.users, user);
            return this.success(removedStudentInfo.success);
        }

        if (classroom.owner !== user.email) {
            return this.fail("api.classrooms.delete.only_owner", {});
        }

        let removedAllStudentsInfo = await removeAllStudents(classroom, this.server.db.classroomsV2, this.server.db.users);
        let deleted = await this.server.db.classrooms.delete(classroom.code);
        return this.success(deleted && removedAllStudentsInfo.success);
    }
}

export default class ClassroomEndpointV2 extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _delete: DeleteRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code", "classroom", 2);

        this._get = new GetRoute(this);
        this._delete = new DeleteRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._delete);
    }
}
import { Request } from "express";
import ClassroomV2 from "../../../data/classrooms/ClassroomV2";
import StudentInClass from "../../../data/classrooms/StudentInClass";
import { getStudentV2, removeStudentFromEmailV2 } from "../../../data/extensions/ClassroomExtensions";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import APIResponse from "../../responses/APIResponse";

class GetRoute extends APIRoute<StudentInClass, ClassroomStudentEndpointV2> {
    public constructor(endpoint: ClassroomStudentEndpointV2) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<StudentInClass>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let code = req.params.code;
        let email = req.params.email;

        let session = sessionInfo.session;
        let userInfo = await this.getUserFromSession(session);

        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;
        if (user.type !== Role.Teacher && user.email !== email) {
            return this.fail("api.restrictions.teachers_owner", {});
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

        let student: StudentInClass;
        try {
            student = getStudentV2(classroom, email);
        }
        catch (err) {
            return this.fail("api.classroom.student.not_found", {"email": email});
        }

        return this.success({
            "email": student.email,
            "name": student.name,
            "tokens": student.tokens,
            "likes": student.likes
        });
    }
}
class DeleteRoute extends APIRoute<boolean, ClassroomStudentEndpointV2> {
    public constructor(endpoint: ClassroomStudentEndpointV2) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<boolean>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let code = req.params.code;
        let email = req.params.email;

        let session = sessionInfo.session;
        let userInfo = await this.getUserFromSession(session);

        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;
        if (user.type !== Role.Teacher && user.email !== email) {
            return this.fail("api.restrictions.teachers_owner", {});
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

        let removeInfo = await removeStudentFromEmailV2(classroom, this.server.db.classroomsV2, this.server.db.users, email);
        return this.success(removeInfo.success);
    }
}

export default class ClassroomStudentEndpointV2 extends APIEndpoint {
    private readonly _get: GetRoute;
    private readonly _delete: DeleteRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/students/:email", "classroom-student", 2);

        this._get = new GetRoute(this);
        this._delete = new DeleteRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._delete);
    }
}
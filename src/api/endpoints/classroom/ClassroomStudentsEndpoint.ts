import { Request } from "express";
import Classroom from "../../../data/classrooms/Classroom";
import JoinedClassroom from "../../../data/classrooms/JoinedClassroom";
import StudentInClass from "../../../data/classrooms/StudentInClass";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import APIResponse from "../../responses/APIResponse";
import { i32 as int } from "typed-numbers";
import { removeAllStudents } from "../../../data/extensions/ClassroomExtensions";

class GetRoute extends APIRoute<StudentInClass[], ClassroomStudentsEndpoint> {
    public constructor(endpoint: ClassroomStudentsEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<StudentInClass[]>> {
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

        return this.success(classroom.students);
    }
}
/**
 * Handles post requests for the classroom endpoint to join a class.
 */
class PostRoute extends APIRoute<JoinedClassroom, ClassroomStudentsEndpoint> {
    public constructor(endpoint: ClassroomStudentsEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<JoinedClassroom>> {
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
        if (user.type !== Role.Student) {
            return this.fail("api.restrictions.students", {});
        }

        if (isInClassCode(user, code)) {
            return this.fail("api.classroom.joined", {});
        }

        let classroom: Classroom;
        try {
            classroom = await this.server.db.classrooms.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        if (!classroom.settings.joinable) {
            return this.fail("api.classroom.not_joinable", {});
        }

        classroom.students.push({
            "email": user.email,
            "name": user.name,
            "tokens": int(0),
            "likes": int(0)
        });

        await this.server.db.classrooms.set(code, classroom);

        user.classes.push({
            "code": code
        });

        await this.server.db.users.set(user.email, user);

        return this.success({
            "code": code,
            "name": classroom.name,
            "tokens": int(0)
        });
    }
}
class DeleteRoute extends APIRoute<boolean, ClassroomStudentsEndpoint> {
    public constructor(endpoint: ClassroomStudentsEndpoint) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<boolean>> {
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

        classroom.students.push({
            "email": user.email,
            "name": user.name,
            "tokens": int(0),
            "likes": int(0)
        });

        return this.success((await removeAllStudents(classroom, this.server.db.classrooms, this.server.db.users)).success);
    }
}

export default class ClassroomStudentsEndpoint extends APIEndpoint {
    private readonly _get: GetRoute;
    private readonly _post: PostRoute;
    private readonly _delete: DeleteRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/students", "classroom-students", 1);

        this._get = new GetRoute(this);
        this._post = new PostRoute(this);
        this._delete = new DeleteRoute(this);
    }
    
    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._post);
        this.addRoute(this._delete);
    }
}
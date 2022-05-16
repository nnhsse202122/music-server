import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import APIController from "../../APIController";
import { i32 as int } from "typed-numbers";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import { Request } from "express";
import APIResponse from "../../responses/APIResponse";
import Role from "../../../data/users/Role";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import { assertContentIsJSON, assertJSONBodyFieldIsNumber, assertJSONBodyIsntNull } from "../EndpointAssert";
import ClassroomV2 from "../../../data/classrooms/ClassroomV2";
import SetStudentLikesRequest from "../../requests/SetStudentLikesRequest";

class GetRoute extends APIRoute<int, ClassroomStudentLikesEndpoint> {
    public constructor(endpoint: ClassroomStudentLikesEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<int>> {
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
        let code = req.params.code;
        let email = req.params.email;

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

        for (let index = 0; index < classroom.students.length; index++) {
            let student = classroom.students[index];
            if (student.email === email) {
                return this.success(student.likes);
            }
        }

        return this.success(int(0));
    }
}

class PostRoute extends APIRoute<int, ClassroomStudentLikesEndpoint> {
    public constructor(endpoint: ClassroomStudentLikesEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<int>> {
        let failResponse = assertContentIsJSON(this, req) ?? 
            assertJSONBodyIsntNull(this, req) ??
            assertJSONBodyFieldIsNumber(this, req, "/likes");

        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as SetStudentLikesRequest;
        
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
        let code = req.params.code;
        let email = req.params.email;

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

        let likes = int(body.likes);

        for (let index = 0; index < classroom.students.length; index++) {
            let student = classroom.students[index];
            if (student.email === email) {
                this.logger.debug("FOUND! Setting likes to '" + likes + "'");
                student.likes = int(Math.max(likes, 0));

                await this.server.db.classroomsV2.set(code, classroom);
                return this.success(student.likes);
            }
        }

        return this.success(int(0));
    }
}

export default class ClassroomStudentLikesEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/students/:email/likes", "classroom-student-likes", 2);

        this._get = new GetRoute(this);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._post);
    }
}
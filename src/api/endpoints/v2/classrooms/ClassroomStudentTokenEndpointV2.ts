import APIEndpoint from "../../../../mvc/api/APIEndpoint";
import APIRoute from "../../../../mvc/api/APIRoute";
import APIController from "../../../APIController";
import { i32 as int } from "typed-numbers";
import RequestMethod from "../../../../mvc/requests/RequestMethod";
import { Request } from "express";
import APIResponse from "../../../responses/APIResponse";
import Role from "../../../../data/users/Role";
import { isInClassCode } from "../../../../data/extensions/UserExtensions";
import { assertContentIsJSON, assertJSONBodyFieldIsNumber, assertJSONBodyIsntNull } from "../../EndpointAssert";
import SetStudentTokensRequest from "../../../requests/SetStudentTokensRequest";
import ClassroomV2 from "../../../../data/classrooms/ClassroomV2";

class GetRoute extends APIRoute<int, ClassroomStudentTokenEndpointV2> {
    public constructor(endpoint: ClassroomStudentTokenEndpointV2) {
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
                return this.success(student.tokens);
            }
        }

        return this.success(int(0));
    }
}

class PostRoute extends APIRoute<int, ClassroomStudentTokenEndpointV2> {
    public constructor(endpoint: ClassroomStudentTokenEndpointV2) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<int>> {
        let failResponse = assertContentIsJSON(this, req) ?? 
            assertJSONBodyIsntNull(this, req) ??
            assertJSONBodyFieldIsNumber(this, req, "/tokens");

        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as SetStudentTokensRequest;
        
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

        let tokens = int(body.tokens);

        for (let index = 0; index < classroom.students.length; index++) {
            let student = classroom.students[index];
            if (student.email === email) {
                this.logger.debug("FOUND! Setting tokens to '" + tokens + "'");
                student.tokens = int(Math.max(tokens, 0));

                await this.server.db.classroomsV2.set(code, classroom);
                return this.success(student.tokens);
            }
        }

        return this.success(int(0));
    }
}

export default class ClassroomStudentTokenEndpointV2 extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/students/:email/tokens", "classroom-student-tokens", 2);

        this._get = new GetRoute(this);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._post);
    }
}
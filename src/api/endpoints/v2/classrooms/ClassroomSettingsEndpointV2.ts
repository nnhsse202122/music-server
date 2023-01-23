import { Request } from "express";
import Classroom from "../../../../data/classrooms/Classroom";
import ClassroomV2 from "../../../../data/classrooms/ClassroomV2";
import { isInClassCode } from "../../../../data/extensions/UserExtensions";
import Role from "../../../../data/users/Role";
import APIEndpoint from "../../../../mvc/api/APIEndpoint";
import APIRoute from "../../../../mvc/api/APIRoute";
import RequestMethod from "../../../../mvc/requests/RequestMethod";
import APIController from "../../../APIController";
import SetClassroomSettingsRequest from "../../../requests/SetClassroomSettingsRequest";
import UpdateClassroomSettingsRequest from "../../../requests/UpdateClassroomSettingsRequest";
import APIResponse from "../../../responses/APIResponse";
import ClassroomSettingsResponse from "../../../responses/ClassroomSettingsResponse";
import { assertContentIsJSON, assertJSONBodyFieldIsBoolean, assertJSONBodyFieldIsNumber, assertJSONBodyFieldIsString, assertJSONBodyIsntNull } from "../../EndpointAssert";
import { i32 as int } from "typed-numbers";

class GetRoute extends APIRoute<ClassroomSettingsResponse, ClassroomSettingsEndpointV2> {
    public constructor(endpoint: ClassroomSettingsEndpointV2) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSettingsResponse>> {
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

        return this.success({
            "allowSongSubmissions": classroom.settings.allowSongSubmissions,
            "joinable": classroom.settings.joinable,
            "name": classroom.name,
            "playlistVisible": classroom.settings.playlistVisible,
            "submissionsRequireTokens": classroom.settings.submissionsRequireTokens,
            "likesEnabled": classroom.settings.likesEnabled,
            "priorityEnabled": classroom.settings.priorityEnabled,
            "priorityCost": classroom.settings.priorityCost
        });
    }
}

class PostRoute extends APIRoute<ClassroomSettingsResponse, ClassroomSettingsEndpointV2> {
    public constructor(endpoint: ClassroomSettingsEndpointV2) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSettingsResponse>> {
        let failResponse = assertContentIsJSON(this, req) ??
            assertJSONBodyIsntNull(this, req) ??
            assertJSONBodyFieldIsString(this, req, "/name") ??
            assertJSONBodyFieldIsBoolean(this, req, "/allowSongSubmissions") ??
            assertJSONBodyFieldIsBoolean(this, req, "/submissionsRequireTokens") ??
            assertJSONBodyFieldIsBoolean(this, req, "/joinable") ??
            assertJSONBodyFieldIsBoolean(this, req, "/playlistVisible") ??
            assertJSONBodyFieldIsNumber(this, req, "/priorityCost") ??
            assertJSONBodyFieldIsBoolean(this, req, "/priorityEnabled") ??
            assertJSONBodyFieldIsBoolean(this, req, "/likesVisible") ??
            assertJSONBodyFieldIsBoolean(this, req, "/likesEnabled");

        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as SetClassroomSettingsRequest;

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

        let name = body.name.trim();
        if (name.length === 0) {
            return this.fail("api.body.field.required", { "field_name": "name", "path": "/" });
        }

        classroom.settings = {
            "allowSongSubmissions": body.allowSongSubmissions,
            "joinable": body.joinable,
            "playlistVisible": body.playlistVisible,
            "submissionsRequireTokens": body.submissionsRequireTokens,
            "likesEnabled": body.likesEnabled,
            "priorityEnabled": body.priorityEnabled,
            "priorityCost": int(body.priorityCost),
            "likesVisible": body.likesVisible
        };
        classroom.name = name;

        await this.server.db.classroomsV2.set(code, classroom);

        return this.success({
            "allowSongSubmissions": classroom.settings.allowSongSubmissions,
            "joinable": classroom.settings.joinable,
            "name": classroom.name,
            "playlistVisible": classroom.settings.playlistVisible,
            "submissionsRequireTokens": classroom.settings.submissionsRequireTokens,
            "priorityCost": classroom.settings.priorityCost,
            "priorityEnabled": classroom.settings.priorityEnabled,
            "likesEnabled": classroom.settings.likesEnabled
        });
    }
}

class PutRoute extends APIRoute<ClassroomSettingsResponse, ClassroomSettingsEndpointV2> {
    public constructor(endpoint: ClassroomSettingsEndpointV2) {
        super(endpoint, RequestMethod.PUT);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSettingsResponse>> {
        let failResponse = assertContentIsJSON(this, req) ??
            assertJSONBodyIsntNull(this, req) ??
            assertJSONBodyFieldIsString(this, req, "/name") ??
            assertJSONBodyFieldIsBoolean(this, req, "/allowSongSubmissions") ??
            assertJSONBodyFieldIsBoolean(this, req, "/submissionsRequireTokens") ??
            assertJSONBodyFieldIsBoolean(this, req, "/joinable") ??
            assertJSONBodyFieldIsBoolean(this, req, "/playlistVisible");

        if (failResponse != null) {
            return failResponse;
        }

        let body = req.body as UpdateClassroomSettingsRequest;
        if (body.name !== undefined) {
            failResponse ??= assertJSONBodyFieldIsString(this, req, "/name");
        }
        if (body.allowSongSubmissions !== undefined) {
            failResponse ??= assertJSONBodyFieldIsBoolean(this, req, "/allowSongSubmissions");
        }
        if (body.submissionsRequireTokens !== undefined) {
            failResponse ??= assertJSONBodyFieldIsBoolean(this, req, "/submissionsRequireTokens");
        }
        if (body.joinable !== undefined) {
            failResponse ??= assertJSONBodyFieldIsBoolean(this, req, "/joinable");
        }
        if (body.playlistVisible !== undefined) {
            failResponse ??= assertJSONBodyFieldIsBoolean(this, req, "/playlistVisible");
        }
        if (body.priorityEnabled !== undefined) {
            failResponse ??= assertJSONBodyFieldIsBoolean(this, req, "/priorityEnabled");
        }
        if (body.likesEnabled !== undefined) {
            failResponse ??= assertJSONBodyFieldIsBoolean(this, req, "/likesEnabled");
        }
        if (body.likesVisible !== undefined) {
            failResponse ??= assertJSONBodyFieldIsBoolean(this, req, "/likesVisible");
        }
        if (body.priorityCost !== undefined) {
            failResponse ??= assertJSONBodyFieldIsNumber(this, req, "/priorityCost");
        }

        if (failResponse != null) {
            return failResponse;
        }

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

        let name = body.name?.trim() ?? classroom.name;
        if (name.length === 0) {
            return this.fail("api.body.field.required", { "field_name": "name", "path": "/" });
        }

        classroom.settings.allowSongSubmissions = body.allowSongSubmissions ?? classroom.settings.allowSongSubmissions;
        classroom.settings.submissionsRequireTokens = body.submissionsRequireTokens ?? classroom.settings.submissionsRequireTokens;
        classroom.settings.joinable = body.joinable ?? classroom.settings.joinable;
        classroom.settings.playlistVisible = body.playlistVisible ?? classroom.settings.playlistVisible;
        classroom.settings.likesEnabled = body.likesEnabled ?? classroom.settings.likesEnabled;
        classroom.settings.priorityEnabled = body.priorityEnabled ?? classroom.settings.priorityEnabled;
        classroom.settings.priorityCost = int(body.priorityCost ?? classroom.settings.priorityCost);
        classroom.settings.likesEnabled = body.likesEnabled ?? classroom.settings.likesEnabled;
        classroom.settings.likesVisible = body.likesVisible ?? classroom.settings.likesVisible;
        classroom.name = name;

        await this.server.db.classroomsV2.set(code, classroom);

        return this.success({
            "allowSongSubmissions": classroom.settings.allowSongSubmissions,
            "joinable": classroom.settings.joinable,
            "name": classroom.name,
            "playlistVisible": classroom.settings.playlistVisible,
            "submissionsRequireTokens": classroom.settings.submissionsRequireTokens,
            "likesEnabled": classroom.settings.likesEnabled,
            "priorityCost": classroom.settings.priorityCost,
            "priorityEnabled": classroom.settings.priorityEnabled
        });
    }
}

class DeleteRoute extends APIRoute<ClassroomSettingsResponse, ClassroomSettingsEndpointV2> {
    public constructor(endpoint: ClassroomSettingsEndpointV2) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSettingsResponse>> {
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

        classroom.settings = {
            "allowSongSubmissions": true,
            "joinable": false,
            "playlistVisible": false,
            "submissionsRequireTokens": false,
            "likesEnabled": false,
            "priorityCost": int(0),
            "priorityEnabled": false,
            "likesVisible": false
        };

        await this.server.db.classroomsV2.set(code, classroom);

        return this.success({
            "allowSongSubmissions": classroom.settings.allowSongSubmissions,
            "joinable": classroom.settings.joinable,
            "name": classroom.name,
            "playlistVisible": classroom.settings.playlistVisible,
            "submissionsRequireTokens": classroom.settings.submissionsRequireTokens,
            "likesEnabled": classroom.settings.likesEnabled,
            "priorityCost": classroom.settings.priorityCost,
            "priorityEnabled": classroom.settings.priorityEnabled,
            "likesVisible": classroom.settings.likesVisible
        });
    }
}

export default class ClassroomSettingsEndpointV2 extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _post: PostRoute;
    private readonly _put: PutRoute;
    private readonly _delete: DeleteRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/settings", "classroom-settings", 2);

        this._get = new GetRoute(this);
        this._post = new PostRoute(this);
        this._put = new PutRoute(this);
        this._delete = new DeleteRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._post);
        this.addRoute(this._put);
        this.addRoute(this._delete);
    }
}
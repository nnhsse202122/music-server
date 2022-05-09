import { Request } from "express";
import Role from "../../../data/users/Role";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import APIResponse from "../../responses/APIResponse";
import CreatedClassroomResponse from "../../responses/CreatedClassroomResponse";
import GottenClassroom from "../../responses/GottenClassroom";
import GottenClassroomAsStudent from "../../responses/GottenClassroomAsStudent";
import GottenClassroomAsTeacher from "../../responses/GottenClassroomAsTeacher";
import { i32 as int } from "typed-numbers";
import { assertContentIsJSON, assertJSONBodyFieldIsBoolean, assertJSONBodyFieldIsString, assertJSONBodyIsntNull } from "../EndpointAssert";
import seedrandom from "seedrandom";
import ClassroomV2 from "../../../data/classrooms/ClassroomV2";
import CreateClassroomV2Request from "../../requests/CreateClassroomV2Request";


class GetRoute extends APIRoute<GottenClassroom[], ClassroomsEndpointV2> {
    public constructor(endpoint: ClassroomsEndpointV2) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<GottenClassroom[]>> {
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

        let gottenClassrooms: GottenClassroom[] = [];

        for (let index = 0; index < user.classes.length; index++) {
            let classroomInfo = user.classes[index];

            let classroom: ClassroomV2;
            try {
                classroom = await this.server.db.classroomsV2.get(classroomInfo.code);
            }
            catch {
                this.logger.debug("Failed to fetch a classroom from a user! Skipping for now, but should be looked in to.");
                continue;
            }

            if (user.type === Role.Teacher) {
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
                };
                gottenClassrooms.push(gottenClassroom);
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
                };
                gottenClassrooms.push(gottenClassroom);
            }
        }

        return this.success(gottenClassrooms);
    }
}

class PostRoute extends APIRoute<CreatedClassroomResponse, ClassroomsEndpointV2> {
    public constructor(endpoint: ClassroomsEndpointV2) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<CreatedClassroomResponse>> {
        let bodyFail = assertContentIsJSON(this, req) ?? 
            assertJSONBodyIsntNull(this, req) ?? 
            assertJSONBodyFieldIsString(this, req, "/name");
        
        if (bodyFail != null) {
            return bodyFail;
        }

        let body = req.body as CreateClassroomV2Request;

        let allowSongSubmissions = true;
        if (body.allowSongSubmissions !== undefined) {
            bodyFail = assertJSONBodyFieldIsBoolean(this, req, "/allowSongSubmissions");
            if (bodyFail != null) {
                return bodyFail;
            }
            allowSongSubmissions = body.allowSongSubmissions;
        }

        let joinable = false;
        if (body.joinable !== undefined) {
            bodyFail = assertJSONBodyFieldIsBoolean(this, req, "/joinable");
            if (bodyFail != null) {
                return bodyFail;
            }

            joinable = body.joinable;
        }

        let submissionsRequireTokens = false;
        if (body.submissionsRequireTokens !== undefined) {
            bodyFail = assertJSONBodyFieldIsBoolean(this, req, "/submissionsRequireTokens");
            if (bodyFail != null) {
                return bodyFail;
            }
            submissionsRequireTokens = body.submissionsRequireTokens;
        }

        let playlistVisible = false;
        if (body.playlistVisible !== undefined) {
            bodyFail = assertJSONBodyFieldIsBoolean(this, req, "/playlistVisible");
            if (bodyFail != null) {
                return bodyFail;
            }
            playlistVisible = body.playlistVisible;
        }


        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let userInfo = await this.getUserFromSession(sessionInfo.session);
        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;
        if (user.type != Role.Teacher) {
            return this.fail("api.restrictions.teachers", {});
        }

        let random = seedrandom(user.email + "_" + Date.now());
        let code = "";
        do {
            let codeSize = int(Math.floor(random() * 2) + 6);

            for (let i = 0; i < codeSize; i++) {
                code += String.fromCharCode("A".charCodeAt(0) + Math.floor(random() * 26));
            }
        }
        while (await this.server.db.classroomsV2.contains(code));

        let classroom: ClassroomV2 = {
            code: code,
            name: body.name,
            owner: user.email,
            playlist: {
                currentSong: {
                    fromPriority: false,
                    index: int(0)
                },
                songs: [],
                priority: []
            },
            settings: {
                allowSongSubmissions: allowSongSubmissions,
                submissionsRequireTokens: submissionsRequireTokens,
                joinable: joinable,
                playlistVisible: playlistVisible
            },
            students: []
        };

        await this.server.db.classroomsV2.add(code, classroom);

        user.classes.push({ "code": code });

        await this.server.db.users.set(user.email, user);

        return this.success({
            "code": classroom.code,
            "name": classroom.name
        });
    }
}

export default class ClassroomsEndpointV2 extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms", "classrooms", 2);

        this._get = new GetRoute(this);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._post);
    }
}
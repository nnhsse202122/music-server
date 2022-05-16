import { Request } from "express";
import Classroom from "../../../data/classrooms/Classroom";
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
import CreateClassroomRequest from "../../requests/CreateClassroomRequest";
import PlaylistReference from "../../../data/playlists/PlaylistReference";
import seedrandom from "seedrandom";


class GetRoute extends APIRoute<GottenClassroom[], ClassroomsEndpoint> {
    public constructor(endpoint: ClassroomsEndpoint) {
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

            let classroom: Classroom;
            try {
                classroom = await this.server.db.classrooms.get(classroomInfo.code);
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

class PostRoute extends APIRoute<CreatedClassroomResponse, ClassroomsEndpoint> {
    public constructor(endpoint: ClassroomsEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<CreatedClassroomResponse>> {
        let bodyFail = assertContentIsJSON(this, req) ?? 
            assertJSONBodyIsntNull(this, req) ?? 
            assertJSONBodyFieldIsString(this, req, "/name");
        
        if (bodyFail != null) {
            return bodyFail;
        }

        let body = req.body as CreateClassroomRequest;

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

        let playlist: PlaylistReference | null = null;
        if (body.playlist !== undefined) {
            bodyFail = assertJSONBodyFieldIsString(this, req, "/playlist/id") ?? assertJSONBodyFieldIsString(this, req, "/playlist/owner");
            if (bodyFail != null) {
                return bodyFail;
            }

            if (!await this.server.db.playlists.canAccess(user.email, body.playlist.owner, body.playlist.id)) {
                return this.fail("api.playlist.not_found", {});
            }
            playlist = body.playlist;
        }

        let random = seedrandom(user.email + "_" + Date.now());
        let code = "";
        do {
            let codeSize = int(Math.floor(random() * 2) + 6);

            for (let i = 0; i < codeSize; i++) {
                code += String.fromCharCode("A".charCodeAt(0) + Math.floor(random() * 26));
            }
        }
        while (await this.server.db.classrooms.contains(code));

        let classroom: Classroom = {
            code: code,
            name: body.name,
            owner: user.email,
            playlist: {
                currentSongPosition: int(0),
                modifications: [],
                playlist: playlist
            },
            settings: {
                allowSongSubmissions: allowSongSubmissions,
                submissionsRequireTokens: submissionsRequireTokens,
                joinable: joinable,
                playlistVisible: playlistVisible,
                priorityCost: int(0),
                priorityEnabled: false,
                likesEnabled: false,
                likesVisible: false
            },
            students: []
        };

        await this.server.db.classrooms.add(code, classroom);

        user.classes.push({ "code": code });

        await this.server.db.users.set(user.email, user);

        return this.success({
            "code": classroom.code,
            "name": classroom.name
        });
    }
}

export default class ClassroomsEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;
    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms", "classrooms", 1);

        this._get = new GetRoute(this);
        this._post = new PostRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
        this.addRoute(this._post);
    }
}
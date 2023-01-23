import { Request, Response } from "express";
import CreatedSession from "../../../../data/sessions/CreatedSession";
import User from "../../../../data/users/User";
import APIEndpoint from "../../../../mvc/api/APIEndpoint";
import APIRoute from "../../../../mvc/api/APIRoute";
import RequestMethod from "../../../../mvc/requests/RequestMethod";
import { getRoleFromEmail } from "../../../../util/RoleUtil";
import APIController from "../../../APIController";
import APIServerRequest from "../../../requests/APIServerRequest";
import AuthorizeRequest from "../../../requests/AuthorizeRequest";
import APIResponse from "../../../responses/APIResponse";
import AuthorizeResponse from "../../../responses/AuthorizeResponse";
import { assertJSONBodyIsntNull, assertContentIsJSON, assertJSONBodyFieldIsDefined, assertJSONBodyFieldIsString } from "../../EndpointAssert";

class PostRoute extends APIRoute<AuthorizeResponse, AuthEndpoint> {
    public constructor(endpoint: AuthEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<AuthorizeResponse>> {
        let error = assertContentIsJSON(this, req) ??
            assertJSONBodyIsntNull(this, req) ??
            assertJSONBodyFieldIsString(this, req, "/token");

        if (error != null) {
            return error;
        }

        let body = req.body as AuthorizeRequest;
        
        let token = body.token;
        let createdSession: CreatedSession;

        try {
            createdSession = await this.server.db.sessions.createSession(token);
        }
        catch (ex) {
            this.logger.debug("Exception whilst creating session: " + ex);
            let message: string;
            if (ex instanceof Error) {
                message = ex.message;
            }
            else {
                message = new String(ex) as string;
            }

            return this.fail("api.authorization.create", {
                "message": message
            });
        }

        // add user to database if not present
        if (!await this.server.db.users.contains(createdSession.email)) {
            let roleOrNot = getRoleFromEmail(createdSession.email);

            if (roleOrNot != null) {
                let role = roleOrNot;
                let user: User = {
                    "type": role,
                    "classes": [],
                    "profile_url": createdSession.profile_url,
                    "playlists": [],
                    "email": createdSession.email,
                    "name": createdSession.name
                };

                await this.server.db.users.add(createdSession.email, user);
            }
        }
        else {
            // update name and profile picture
            let user = await this.server.db.users.get(createdSession.email);
            user.name = createdSession.name;
            user.profile_url = createdSession.profile_url;
            await this.server.db.users.set(createdSession.email, user);
        }

        return this.success({
            "expires_at": createdSession.expires_at,
            "token": createdSession.token
        });
    }

}

class DeleteRoute extends APIRoute<boolean, AuthEndpoint> {
    public constructor(endpoint: AuthEndpoint) {
        super(endpoint, RequestMethod.DELETE);
    }

    protected async doHandle(req: Request): Promise<APIResponse<boolean>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        return this.success(await this.server.db.sessions.delete(sessionInfo.sessionID));
    }
}

export default class AuthEndpoint extends APIEndpoint {
    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/authorize", "authorize", 2);
        this._post = new PostRoute(this);
    }

    protected override setup(): void {
        this.addRoute(this._post);
    }

}
import APIController from "../../api/APIController";
import RouteBase from "../RouteBase";
import APIEndpoint from "./APIEndpoint";
import { Request, Response } from "express";
import APISuccessReponse from "../../api/responses/APISuccessResponse";
import APIResponse from "../../api/responses/APIResponse";
import { apiErrors, getAsAPIError, GetAsAPIErrorFunction } from "../../util/api/APIErrorList";
import RequestMethod from "../requests/RequestMethod";
import APIFailResponse from "../../api/responses/APIFailResponse";
import Session from "../../data/sessions/Session";
import User from "../../data/users/User";

type VerifiedItemInfo<TInfo> = {
    verified: false,
    response: APIFailResponse
} | ({
    verified: true 
} & TInfo);

type VerifiedSessionInfo = VerifiedItemInfo<{
    session: Session
    sessionID: string
}>;
type VerifiedUserInfo = VerifiedItemInfo<{
    user: User
}>;

export default abstract class APIRoute<TData, TEndpoint extends APIEndpoint> extends RouteBase<TEndpoint, APIController> {

    public readonly fail: GetAsAPIErrorFunction<typeof apiErrors>;

    protected constructor(endpoint: TEndpoint, method: RequestMethod) {
        super(endpoint, method);

        this.fail = getAsAPIError;
    }

    protected abstract doHandle(req: Request): Promise<APIResponse<TData>>;
    public async handle(req: Request, res: Response): Promise<void> {
        let response = await this.doHandle(req);
        if (response.success) {
            res.status(200).contentType("application/json").send(JSON.stringify(response));
            return;
        }

        res.status(response.status).contentType("application/json").send(JSON.stringify(response));
    }

    public success<TData>(data: TData): APISuccessReponse<TData> {
        return {
            "success": true,
            "data": data
        };
    }

    protected async verifySession(req: Request): Promise<VerifiedSessionInfo> {
        if (req.headers.authorization == null) {
            return {
                verified: false,
                response: this.fail("api.authorization.header.required", {})
            };
        }

        let authHeader = req.headers.authorization;
        let authParts = authHeader.split(" ", 2);
        if (authParts.length != 2) {
            return {
                verified: false,
                response: this.fail("api.authorization.parts.invalid", {})
            };
        }

        let authType = authParts[0];
        let authToken = authParts[1];

        if (authType !== "Basic") {
            return {
                verified: false,
                response: this.fail("api.authorization.parts.invalid", { "type": authType })
            };
        }

        return await this.verifySessionFromToken(authToken);
        
    }

    private async verifySessionFromToken(authToken: string | null): Promise<VerifiedSessionInfo> {
        if (authToken == null) {
            return {
                verified: false,
                response: this.fail("api.authorization.token.required", {})
            };
        }

        let session: Session;
        try {
            session = await this.server.db.sessions.get(authToken);
        }
        catch(err) {
            console.error(err);
            return {
                verified: false,
                response: this.fail("api.authorization.token.invalid", {})
            };
        }

        return {
            verified: true,
            sessionID: authToken,
            session: session
        };
    }

    protected async getUserFromSession(session: Session): Promise<VerifiedUserInfo> {
        let user: User;
        try {
            user = await this.server.db.users.get(session.email);
        }
        catch {
            // if an exception is thrown, literally there is and was no hope
            // for humanity in the first place.
            this.logger.error("Somehow the user from a session wasn't in the database. This is not good!");
            
            return {
                verified: false,
                response: this.fail("api.server", {})
            };
        }

        return {
            verified: true,
            user: user
        };
    }
}
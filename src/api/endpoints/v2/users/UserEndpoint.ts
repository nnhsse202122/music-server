import { Request } from "express";
import FetchedLocalUser from "../../../../data/playlists/FetchedLocalUser";
import FetchedNonLocalUser from "../../../../data/playlists/FetchedNonLocalUser";
import FetchedUser from "../../../../data/playlists/FetchedUser";
import User from "../../../../data/users/User";
import APIEndpoint from "../../../../mvc/api/APIEndpoint";
import APIRoute from "../../../../mvc/api/APIRoute";
import RequestMethod from "../../../../mvc/requests/RequestMethod";
import APIController from "../../../APIController";
import APIResponse from "../../../responses/APIResponse";

class GetRoute extends APIRoute<FetchedUser, UserEndpoint> {

    public constructor(endpoint: UserEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<FetchedUser>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let email = req.params.email;
        if (email === "@me") {
            let userInfo = await this.getUserFromSession(sessionInfo.session);
            if (!userInfo.verified) {
                return userInfo.response;
            }

            let user = userInfo.user;
            let fetchedUser: FetchedLocalUser = {
                "classrooms": user.classes.map((c) => c.code),
                "email": user.email,
                "name": user.name,
                "profile_url": user.profile_url,
                "playlists": user.playlists.map((p) => p.id),
                "role": user.type
            };
            return this.success(fetchedUser);
        }

        try {
            let user: User = await this.server.db.users.get(email);
            let fetchedUser: FetchedNonLocalUser = {
                "email": user.email,
                "name": user.name,
                "profile_url": user.profile_url,
                "role": user.type
            };
            return this.success(fetchedUser);
        }
        catch {
            return this.fail("api.user.not_found", { "email": email });
        }
    }
}

export default class UserEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;

    public constructor(controller: APIController) {
        super(controller, "/users/:email", "user", 2);

        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
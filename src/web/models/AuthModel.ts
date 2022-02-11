import { Request, Response } from "express";
import fetch from "node-fetch";
import RequestMethod from "../../mvc/requests/RequestMethod";
import WebModel from "../../mvc/web/WebModel";
import WebRoute from "../../mvc/web/WebRoute";
import SongServerAPI from "../SongServerAPI";
import WebController from "../WebController";

class GetRoute extends WebRoute<AuthModel> {
    public constructor(model: AuthModel) {
        super(model, RequestMethod.GET);
    }

    protected async doHandle(req: Request, res: Response): Promise<void> {
        if (req.query.error != null) {
            this.logger.error(req.query.error);
            res.redirect("/");
            return;
        }

        let code = req.query.code;
        if (typeof code !== "string") {
            return;
        }

        let tokenResponse = await fetch(`https://oauth2.googleapis.com/token?client_id=${encodeURIComponent(this.server.oauthID)}&client_secret=${encodeURIComponent(this.server.oauthSecret)}&code=${encodeURIComponent(code)}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(this.server.oauthRedirectURI)}`, {
            "method": "POST"
        });

        let token = (await tokenResponse.json()).id_token as string;

        let response = await SongServerAPI().authorization.auth({
            "token": token
        });

        if (response.success) {
            res.cookie("authorization", response.data.token, {
                // @ts-ignore
                "expires": new Date(response.data.expires_at)
            });
        }

        res.redirect("/");
        return;
    }
}

export default class AuthModel extends WebModel {
    private readonly _get: GetRoute;

    public constructor(controller: WebController) {
        super(controller, "/account/auth");

        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
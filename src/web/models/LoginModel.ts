import { Request, Response } from "express";
import RequestMethod from "../../mvc/requests/RequestMethod";
import WebModel from "../../mvc/web/WebModel";
import WebRoute from "../../mvc/web/WebRoute";
import WebController from "../WebController";

class GetRoute extends WebRoute<LoginModel> {
    public constructor(model: LoginModel) {
        super(model, RequestMethod.GET);
    }

    protected async doHandle(req: Request, res: Response): Promise<void> {
        res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(this.server.oauthRedirectURI)}&response_type=code&client_id=${encodeURIComponent(this.server.oauthID)}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&access_type=offline`);
    }

}

export default class LoginModel extends WebModel {
    private readonly _get: GetRoute;

    public constructor(controller: WebController) {
        super(controller, "/account/login");
        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
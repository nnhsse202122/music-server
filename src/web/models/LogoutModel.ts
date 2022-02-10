import RequestMethod from "../../mvc/requests/RequestMethod";
import WebRoute from "../../mvc/web/WebRoute";
import { Request, Response } from "express";
import WebModel from "../../mvc/web/WebModel";
import WebController from "../WebController";

class GetRoute extends WebRoute<LogoutModel> {
    public constructor(model: LogoutModel) {
        super(model, RequestMethod.GET);
    }

    protected async doHandle(req: Request, res: Response): Promise<void> {
        res.clearCookie("authorization");
        res.redirect("/");
    }

}

export default class LogoutModel extends WebModel {
    private readonly _get: GetRoute;

    public constructor(controller: WebController) {
        super(controller, "/account/logout");
        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
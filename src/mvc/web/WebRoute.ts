import WebModel from "./WebModel";
import RouteBase from "../RouteBase";
import WebController from "../../web/WebController";
import RequestMethod from "../requests/RequestMethod";
import { Request, Response } from "express";

abstract class WebRoute<TModel extends WebModel> extends RouteBase<TModel, WebController> {
    protected constructor(model: TModel, method: RequestMethod) {
        super(model, method);
    }

    protected abstract doHandle(req: Request, res: Response): Promise<void>;

    public override handle(req: Request, res: Response): Promise<void> {
        return this.doHandle(req, res);
    }
}

export default WebRoute;
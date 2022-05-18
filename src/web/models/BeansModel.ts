import { Request, Response } from "express";
import RequestMethod from "../../mvc/requests/RequestMethod";
import WebModel from "../../mvc/web/WebModel";
import WebRoute from "../../mvc/web/WebRoute";
import SongServerAPI from "../SongServerAPI";
import WebController from "../WebController";

class GetRoute extends WebRoute<BeansModel> {

    public constructor(model: BeansModel) {
        super(model, RequestMethod.GET);
    }

    protected async doHandle(req: Request, res: Response): Promise<void> {
        let beansResponse = await SongServerAPI().beans.get();
        if (!beansResponse.success) {
            this.logger.fatal("THE BEANS WERE NOT SUCCESSFUL!");
            res.redirect("/");
            return;
        }

        res.contentType("image/jpeg").send(Buffer.from(beansResponse.data.split(',', 2)[1], "base64"));
    }
}

export default class BeansModel extends WebModel {
    private readonly _get: GetRoute;

    public constructor(controller: WebController) {
        super(controller, "/beans");
        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
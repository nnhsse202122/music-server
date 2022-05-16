import { Request, Response } from "express";
import FetchedUser from "../../data/playlists/FetchedUser";
import RequestMethod from "../../mvc/requests/RequestMethod";
import WebModel from "../../mvc/web/WebModel";
import WebRoute from "../../mvc/web/WebRoute";
import SongServerAPI from "../SongServerAPI";
import WebController from "../WebController";

class GetRoute extends WebRoute<SongsModel> {
    public constructor(model: SongsModel) {
        super(model, RequestMethod.GET);
    }

    protected async doHandle(req: Request, res: Response): Promise<void> {
        let source = req.params.source;
        let id = req.params.id;

        if (source === "youtube") {
            res.redirect(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`);
            return;
        }
        res.redirect("/");
    }
}

export default class SongsModel extends WebModel {
    private readonly _get: GetRoute;

    public constructor(controller: WebController) {
        super(controller, "/songs/:source/:id");
        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
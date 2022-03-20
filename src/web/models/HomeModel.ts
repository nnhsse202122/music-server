import { Request, Response } from "express";
import FetchedUser from "../../data/playlists/FetchedUser";
import RequestMethod from "../../mvc/requests/RequestMethod";
import WebModel from "../../mvc/web/WebModel";
import WebRoute from "../../mvc/web/WebRoute";
import SongServerAPI from "../SongServerAPI";
import WebController from "../WebController";

class GetRoute extends WebRoute<HomeModel> {
    public constructor(model: HomeModel) {
        super(model, RequestMethod.GET);
    }

    protected async doHandle(req: Request, res: Response): Promise<void> {
        let auth = req.cookies.authorization != null ? ("Basic " + req.cookies.authorization) : "";
        
        let verifyResponse = await SongServerAPI().users.me().get(auth);
        console.log(verifyResponse);
        let user: FetchedUser | null;
        if (verifyResponse.success) {
            user = verifyResponse.data;

            let classes = await SongServerAPI().classrooms.list(auth);
            if (classes.success) {
                res.redirect("/classes");
                return;
            }
        }
        else {
            user = null;
        }

        res.render("./routes/home", {
            user: user
        });
    }
}

export default class HomeModel extends WebModel {
    private readonly _get: GetRoute;

    public constructor(controller: WebController) {
        super(controller, "/");
        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
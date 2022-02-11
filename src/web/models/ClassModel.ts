import { Request, Response } from "express";
import FetchedUser from "../../data/playlists/FetchedUser";
import RequestMethod from "../../mvc/requests/RequestMethod";
import WebModel from "../../mvc/web/WebModel";
import WebRoute from "../../mvc/web/WebRoute";
import SongServerAPI from "../SongServerAPI";
import WebController from "../WebController";

class GetRoute extends WebRoute<ClassModel> {

    public constructor(model: ClassModel) {
        super(model, RequestMethod.GET);
    }

    protected async doHandle(req: Request, res: Response): Promise<void> {
        let code = req.params.code;
        let auth = req.cookies.authorization != null ? ("Basic " + req.cookies.authorization) : "";
        let verifyResponse = await SongServerAPI().users.me().get(auth);
        let user: FetchedUser;
        if (verifyResponse.success) {
            user = verifyResponse.data;
        }
        else {
            res.redirect("/account/login");
            return;
        }

        let classResponse = await SongServerAPI().classrooms.find(code).get(auth);
        if (!classResponse.success) {
            res.redirect("/classes");
            return;
        }

        let classroom = classResponse.data;
        
        res.render("./routes/class", {
            "user": user,
            "classroom": classroom
        });
    }
}

export default class ClassModel extends WebModel {
    private readonly _get: GetRoute;

    public constructor(controller: WebController) {
        super(controller, "/classes/:code");
        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
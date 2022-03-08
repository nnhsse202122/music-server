import { Request, Response } from "express";
import GottenClassroom from "../../api/responses/GottenClassroom";
import FetchedUser from "../../data/playlists/FetchedUser";
import RequestMethod from "../../mvc/requests/RequestMethod";
import WebModel from "../../mvc/web/WebModel";
import WebRoute from "../../mvc/web/WebRoute";
import SongServerAPI from "../SongServerAPI";
import WebController from "../WebController";

class GetRoute extends WebRoute<ClassesModel> {
    public constructor(model: ClassesModel) {
        super(model, RequestMethod.GET);
    }

    protected async doHandle(req: Request, res: Response): Promise<void> {
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

        let classesResponse = await SongServerAPI().classrooms.list(auth);
        let classes: GottenClassroom[];
        if (classesResponse.success) {
            classes = classesResponse.data;
            for (let index = 0; index < classes.length; index++) {
                console.log(classes[index]);
            }
        }
        else {
            classes = [];
            this.logger.warn("Failed to fetch classes: " + JSON.stringify(classesResponse, undefined, 4));
        }

        res.render("./routes/classes", {
            user: user,
            classrooms: classes,
             apiDomain: process.env.API_DOMAIN
        });
    }
}

export default class ClassesModel extends WebModel {
    private readonly _get: GetRoute;

    public constructor(controller: WebController) {
        super(controller, "/classes");
        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
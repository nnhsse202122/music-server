import { Router } from "express";
import Model from "../../Model";
import WebController from "../WebController";


export default class HomeModel extends Model<HomeModel, WebController> {

    public constructor(controller: WebController) {
        super(controller, "");
    }

    protected initRoutes(router: Router): void {
        router.get("/", (req, res) => {
            res.render("./layouts/home");
        });
    }

}
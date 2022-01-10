import { Router } from "express";
import { LoginTicket } from "google-auth-library";
import Model from "../../Model";
import { getRoleFromEmail } from "../../Server";
import WebController from "../WebController";

export default class DashboardModel extends Model<DashboardModel, WebController> {
    
    public constructor(controller: WebController) {
        super(controller, "dashboard");
    }

    protected override initRoutes(router: Router): void {
        router.get("/", async (req, res) => {
            if (req.cookies.token == null) {
                return res.redirect("/"); //redirect to home page
            }

            let session: SongServer.Data.Session;
            try {
                session = await this.authorize(req.cookies.token);
            }
            catch(err) {
                return res.redirect("/")
            }

            // check if teacher
            let role = getRoleFromEmail(session.email)

            res.render("./layouts/dashboard", { "view": role });
        });
    }
}
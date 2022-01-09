import { Router } from "express";
import { LoginTicket } from "google-auth-library";
import Model from "../../Model";
import WebController, { VALID_EMAIL_REGEX } from "../WebController";

export default class DashboardModel extends Model<DashboardModel, WebController> {
    
    public constructor(controller: WebController) {
        super(controller, "/dashboard");
    }

    protected override initRoutes(router: Router): void {
        router.get("/", async (req, res) => {
            if (req.session.token == null) {
                return res.redirect("/"); //redirect to home page
            }

            let loginTicket: LoginTicket;
            try {
                loginTicket = await this.controller.apiController.authClient.verifyIdToken({
                    "idToken": req.session.token,
                    "audience": this.controller.apiController.authClientID
                });
            }
            catch (err) {
                let message: string;
                if (err instanceof Error) {
                    message = err.message;
                }
                else {
                    message = new String(err) as string;
                }

                this.logger.debug("Error whilst verifying: " + message);
                return res.redirect("/");
            }

            // check if teacher
            let isStudent: boolean = false;
            loginTicket.getPayload()!.email!.replace(VALID_EMAIL_REGEX, (res, _, stu) => {
                if (stu != null && new String(stu).length > 0) {
                    isStudent = true;
                }
                return "";
            });

            res.render("/layouts/dashboard", { "view": (isStudent ? "student" : "teacher")});
        });
    }
}
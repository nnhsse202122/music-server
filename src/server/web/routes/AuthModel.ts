import { Request, Router } from "express";
import { LoginTicket } from "google-auth-library";
import Model from "../../Model";
import WebController from "../WebController";
import APIAuthModel from "../../api/routes/Auth";

export default class AuthModel extends Model<AuthModel, WebController> {

    public constructor(controller: WebController) {
        // version 1
        super(controller, "authorize");
    }

    protected override initRoutes(router: Router): void {
        router.post("/", async (req, res) => {
            let body: SongServer.API.Client.Requests.AuthorizeRequest = req.body;
            if (body == null) {
                res.status(400).send({
                    "success": false,
                    "message": "A body is required"
                });
                return;
            }

            let model = this.controller.apiController.models.find((m) => m instanceof APIAuthModel) as APIAuthModel;
            if (model == null) {
                res.status(500).send({
                    "success": false,
                    "message": "Failed to find auth"
                });
                return;
            }

            try {
                let authInfo = await model.doAuth(req, body);

                if (authInfo.success) {
                    res.cookie("token", authInfo.data.token).send({
                        "success": true,
                        "data": authInfo.data
                    });
                }
                else {
                    res.status(authInfo.status).send({
                        "success": false,
                        "message": authInfo.message
                    });
                }

            }
            catch(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Internal server error"
                });
                if (err instanceof Error) {
                    this.logger.warn(err.stack ?? err.message);
                }
                else {
                    this.logger.warn(new String(err) as string);
                }
                return;
            }
        });
    }
}
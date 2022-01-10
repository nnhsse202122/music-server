import { Request, Router } from "express";
import APIController from "../APIController";
import { APIModel, APIResponseInfo } from "../APIModel";


export default class UserModel extends APIModel<UserModel> {

    public constructor(controller: APIController) {
        super(controller, "/users", 1);
    }

    protected override initRoutes(router: Router): void {
        router.get("/", async (req, res) => {
            await this.handleRes(res, this.fetchUser(req));
        });
    }

    public async fetchUser(req: Request): APIResponseInfo<SongServer.API.Responses.FetchUserResponse> {
        let session: SongServer.Data.Session;
        try {
            session = await this.authorizeFromRequest(req);
        }
        catch (err) {
            let message: string;
            if (err instanceof Error) {
                message = err.message;
            }
            else {
                message = new String(err) as string;
            }

            return {
                "message": "Error whilst authorizing: " + message,
                "success": false,
                "status": 403
            };
        }

        let email = session.email;
        let user: SongServer.Data.User;
        try {
            user = await this.userDatabase.get(email);
        }
        catch(err) {
            let message: string;
            if (err instanceof Error) {
                message = err.message;
            }
            else {
                message = new String(err) as string;
            }

            return {
                "success": false,
                "status": 404,
                "message": "User not found"
            };
        }

        return {
            "success": true,
            "data": {
                "currentClass": user.currentClass,
                "email": user.email,
                "name": user.name,
                "type": user.type
            }
        };
    }
}
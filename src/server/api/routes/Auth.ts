import { Request, Router } from "express";
import { LoginTicket } from "google-auth-library";
import { getRoleFromEmail } from "../../Server";
import APIController from "../APIController";
import { APIModel, APIResponseInfo } from "../APIModel";

export default class AuthModel extends APIModel<AuthModel> {

    public constructor(controller: APIController) {
        // version 1
        super(controller, "auth", 1);
    }

    protected override initRoutes(router: Router): void {
        router.post("/", async (req, res) => {
            let body: SongServer.API.Client.Requests.AuthorizeRequest  = req.body;
            await this.handleRes(res, this.doAuth(req, body));
        });
    }

    public async doAuth(req: Request, body: SongServer.API.Client.Requests.AuthorizeRequest): APIResponseInfo<SongServer.API.Responses.AuthorizeResponse> {
        
        if (body.token == null || typeof body.token !== "string") { // check if no token is given [null and undefined]
            // post an error api response. Errors are objects that have 2 fields, a success field, and a
            // message field. The success field is always false for errors,
            // and the message is always a string.
            return {
                "message": "A string token is required for authentication",
                "success": false,
                "status": 400
            }
        }

        // typescript knows that content.token can't be null or undefined, hovering over token
        // reveals it's of type string, unlike when hovering at the 'token' part of content.token
        // in the if statement, which says it's type string or undefined.
        let token = body.token; 

        let createdSession: SongServer.API.CreatedSessionInfo;
        // try-catch to prevent errors from breaking application
        try {
            createdSession = await this.sessionDatabase.createSession(token);
        }
        catch(err) {
            // err is type any because promises can reject with any value.
            // check if it's an actual error object
            if (err instanceof Error) {
                
                // send fail api response
                return {
                    "success": false,
                    "message": "Error validating token: " + err.message,
                    "status": 400
                };
            }
            // otherwise convert to string
            let message = new String(err);

            // send fail api response
            return {
                "message": message as string,
                "success": false,
                "status": 400
            };
        }

        let session = await this.sessionDatabase.get(createdSession.token);
        if (!await this.userDatabase.contains(session.email)) {

            let role = getRoleFromEmail(session.email);
            let user: SongServer.Data.User;
            if (role == "invalid") {
                // send fail api response
                return {
                    "message": "Email is not authorized for this application",
                    "success": false,
                    "status": 401
                };
            }
            else if (role === "student") {
                user = {
                    "type": "student",
                    "classrooms": [],
                    "currentClass": null,
                    "email": session.email,
                    "name": session.name
                };
            }
            else {

                user = {
                    "type": "teacher",
                    "classrooms": [],
                    "currentClass": null,
                    "email": session.email,
                    "name": session.name
                };
            }

            await this.userDatabase.add(session.email, user);
        }

        // send a success response. Success api responses are a JSON object, that have 2 fields.
        // The first is the 'data' field, that contains the result of the request, and the second
        // field is the 'success' field, which would be true because it was successful.
        return {
            "success": true,
            "data": createdSession
        };
    }
}
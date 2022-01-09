// import { Router } from "express";
// import { LoginTicket } from "google-auth-library";
// import APIController from "../APIController";
// import { APIModel } from "../APIModel";

// // a type containing information of how an auth request is formed.
// // an auth request consists of a JSON object with a single field
// // named "token" set to a string
// type AuthRequest = {
//     /** The token of the auth request */
//     token?: string // using ? at the end of the name means the field may not be defined.
//                    // Thus, you have to check if token is undefined.
// }

// // a type containing information about how an auth response is formed
// type AuthResponse = {
//     email: string
// }

// export default class AuthModel extends APIModel<AuthModel> {

//     public constructor(controller: APIController) {
//         // version 1
//         super(controller, "/auth", 1);
//     }

//     protected override initRoutes(router: Router): void {
//         router.post("/", async (req, res) => {
//             let content = req.body as AuthRequest; // as lets you convert from one type (in this case 'any')
//                                                    // to another type (in this case, AuthRequest)
//             if (content.token == null) { // check if no token is given [null and undefined]
//                 // post an error api response. Errors are objects that have 2 fields, a success field, and a
//                 // message field. The success field is always false for errors,
//                 // and the message is always a string.
//                 res.status(400).send({
//                     "message": "A token is required for authentication",
//                     "success": false
//                 });

//                 return; // dont run code below. [guard clause]
//             }

//             // typescript knows that content.token can't be null or undefined, hovering over token
//             // reveals it's of type string, unlike when hovering at the 'token' part of content.token
//             // in the if statement, which says it's type string or undefined.
//             let token = content.token; 

//             let loginTicket: LoginTicket;
//             // try-catch to prevent errors from breaking application
//             try {
//                 loginTicket = await this.controller.authClient.verifyIdToken({
//                     "idToken": token,
//                     "audience": this.controller.authClientID,
//                     // Maybe an expiry should be added?
//                 });
//             }
//             catch(err) {
//                 // err is type any because promises can reject with any value.
//                 // check if it's an actual error object
//                 if (err instanceof Error) {
                    
//                     // send fail api response
//                     res.status(400).send({
//                         "message": "Error validating token: " + err.message,
//                         "success": false
//                     });

//                     return; // prevent other code from running
//                 }
//                 // otherwise convert to string
//                 let message = new String(err);

//                 // send fail api response
//                 res.status(400).send({
//                     "message": message,
//                     "success": false
//                 });
//                 return; // prevent other code from running
//             }

//             let email = loginTicket.getPayload()?.email;
//             if (email == null) { // check if email doesn't exist
//                 // send fail api response, but this time it's probably an internal server error
//                 res.status(500).send({
//                     "message": "Server Error: Failed to fetch email from session",
//                     "success": false
//                 });
//                 return; // prevent other code from running
//             }

//             let result: AuthResponse = {
//                 "email": email
//             };

//             // todo: move tokens away from sessions, and have that handled on the client.
//             req.session.token = token;

//             // send a success response. Success api responses are a JSON object, that have 2 fields.
//             // The first is the 'data' field, that contains the result of the request, and the second
//             // field is the 'success' field, which would be true because it was successful.
//             res.send({
//                 "data": result,
//                 "success": true
//             });
//         });
//     }
// }
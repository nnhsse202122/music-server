import Server from "./Server";

const AUTH_CLIENT_ID = "430954870897-nqat6i8u9fbhsl4kdctnni162isherhh.apps.googleusercontent.com";

let server = new Server(AUTH_CLIENT_ID);
server.start(3000);


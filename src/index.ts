import ConsoleLogHandler from "./ConsoleLogHandler";
import ServerInstance from "./ServerInstance";
import Logger from "./util/logging/Logger";
import dotenv from "dotenv";
import path from "path"

dotenv.config({
    "path": path.resolve(__dirname, "../.env")
});

if (process.env.PRODUCTION == "true") {
    process.env.CLIENT_ID = process.env.PRODUCTION_CLIENT_ID;
    process.env.OAUTH_CLIENT_SECRET = process.env.PRODUCTION_OAUTH_CLIENT_SECRET;
    process.env.API_DOMAIN = process.env.PRODUCTION_API_DOMAIN;
    process.env.MONGO_URI = process.env.PRODUCTION_MONGO_URI;
}
else {
    process.env.CLIENT_ID = process.env.DEV_CLIENT_ID;
    process.env.OAUTH_CLIENT_SECRET = process.env.DEV_OAUTH_CLIENT_SECRET;
    process.env.API_DOMAIN = process.env.DEV_API_DOMAIN;
    process.env.MONGO_URI = process.env.DEV_MONGO_URI;
}

Logger.handler = new ConsoleLogHandler();

let server = new ServerInstance();
server.initialize().then(() => {
    server.start();
});
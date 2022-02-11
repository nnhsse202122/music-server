import ConsoleLogHandler from "./ConsoleLogHandler";
import ServerInstance from "./ServerInstance";
import Logger from "./util/logging/Logger";
import dotenv from "dotenv";
import path from "path"

dotenv.config({
    "path": path.resolve(__dirname, "../.env")
});

Logger.handler = new ConsoleLogHandler();

let server = new ServerInstance();
server.initialize().then(() => {
    server.start();
});
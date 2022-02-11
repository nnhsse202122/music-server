import express from "express";
import * as core from "express-serve-static-core";
import { Controller } from "./mvc/Controller";
import ModelBase from "./mvc/ModelBase";
import WebController from "./web/WebController";
import fetch from "node-fetch";
import Logger from "./util/logging/Logger";
import cookieParser from "cookie-parser";
import pathUtil from "path";
import DataBaseManager from "./data/storage/DataBaseManager";
import SongSource from "./data/playlists/SongSource";
import APIController from "./api/APIController";

type ServerConfig = {
    port: number,
        domain: string
}

type Config = {
    web: ServerConfig,
    api: ServerConfig
};

const REDIRECT_URI = "http://127.0.0.1:3000/account/auth";

export default class ServerInstance {

    private readonly _app: core.Express;
    private readonly _config: Config;
    private readonly _controllers: Controller[];
    private readonly _routers: core.Router[];
    private readonly _logger: Logger;
    private readonly _db: DataBaseManager;
    private _initialized: boolean;

    public constructor() {
        this._logger = new Logger("SERVER");
        this._app = express();
        this._config = require("../config.json");
        this._controllers = [];
        this._routers = [];
        this._initialized = false;

        this._app.use(cookieParser());
        this._app.set("view engine", "ejs");
        this._app.use("/resources", express.static(pathUtil.resolve(__dirname, "../resources")));
        this._app.set("views", pathUtil.resolve(__dirname, "../views/ejs"));
        this._app.use(express.json());

        this._db = new DataBaseManager();
    }

    public get db(): DataBaseManager {
        return this._db;
    }

    public get webURL(): string {
        return `${this._config.web.domain}:${this._config.web.port}`;
    }
    
    public get oauthID(): string {
        return process.env.OAUTH_CLIENT_ID ?? "";
    }
    
    public get oauthSecret(): string {
        return process.env.OAUTH_CLIENT_SECRET ?? "";
    }

    public get oauthRedirectURI(): string {
        return REDIRECT_URI;
    }

    public start(): void {
        if (!this._initialized) throw new Error("Server not initialized yet. Call 'ServerInstance.prototype.initialize' to initialize the server.");
        // todo: figure out why domain:port doesn't work. Im pretty sure my port is clear
        this._app.listen(this._config.web.port
            /*`${this._config.web.domain}:${this._config.web.port}`*/, () => {
            this._logger.info("Server is online!");
        });
    }

    public async initialize(): Promise<void> {
        if (this._initialized) return;
        let start = Date.now();
        this._logger.info("Initializing server...");
        this._logger.info("Connecting to database...");
        await this._db.connect();

        this._initialized = true;

        this._initializeWeb();
        this._initializeAPI();

        for (let index = 0; index < this._controllers.length; index++) {
            this._initializeController(this._controllers[index]);
        }

        for (let index = 0; index < this._routers.length; index++) {
            let router = this._routers[index];
            this._app.use(router);
        }

        /**
         * Time it took to initialize (in milliseconds)
         */
        let timeToInitialize = Date.now() - start;
        this._logger.info(`Server successfully initialized in ${timeToInitialize}ms`);
    }

    private _initializeAPI(): void {
        if (this._config.api.domain !== this._config.web.domain ||
            this._config.api.port !== this._config.web.port) {
            let router = express.Router();

            router.use(async (req, res, next) => {
                let requestPath = req.path;
                if (!requestPath.startsWith("/")) requestPath = "/" + requestPath;
                if (requestPath.startsWith("/api")) {
                    let apiResponse = await fetch(`http://${this._config.api.domain}:${this._config.api.port}${requestPath}`, {
                        "method": req.method,
                        // @ts-ignore
                        "headers": req.headers,
                        "body": req.body
                    });
                    let apiResponseBody = await apiResponse.text();
                    res.contentType("application/json").status(apiResponse.status).send(apiResponseBody);
                    return;
                }
                next();
            });
        }
        else {
            // todo: load api controller
            this._controllers.push(new APIController(this));

            let router404handler = express.Router();
            router404handler.use((req, res, next) => {
                let requestPath = req.path;
                if (!requestPath.startsWith("/")) requestPath = "/" + requestPath;
                if (requestPath.startsWith("/api")) {
                    res.contentType("application/json").send(JSON.stringify({
                        "code": 0,
                        "message": "Unknown API Endpoint/Route",
                        "success": false
                    }));
                    return;
                }
                next();
            });

            this._routers.push(router404handler);
        }
    }

    private _initializeWeb(): void {
        this._controllers.push(new WebController(this));

        // todo: Implement 404 web page.
    }

    private _initializeController(controller: Controller) {
        controller.createModels();

        let models = controller.models;
        for (let index = 0; index < models.length; index++) {
            this._initializeModel(models[index]);
        }
    }

    private _initializeModel(model: ModelBase<any>): void {
        model.initialize();
        let router = express.Router();
        router.all(model.path, async (req, res, next) => {
            let handled = await model.handle(req, res);
            if (!handled) next();
        });
        this._app.use(router);
    }

    public async fetchTitleForSong(songID: string, source: SongSource): Promise<string> {
        switch (source) {
            case SongSource.youtube:
                {
                    let video = await this.db.yt.fetch(songID);
                    if (video != null) {
                        return video.title;
                    }
                    throw new Error(`Failed to fetch video with id '${songID}'`);
                }
            default:
                {
                    throw new Error("Unsupported song source!");
                }
        }
    }
}
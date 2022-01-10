import express, { Request, Router } from "express";
import Controller from "./Controller";
import Logger from "../util/Logger";
import path from "path";
import UserDataBase from "../database/instance/UserDataBase";
import ClassroomDataBase from "../database/instance/ClassroomDataBase";
import PlaylistDataBase from "../database/instance/PlaylistDataBase";
import SessionDataBase from "../database/instance/SessionDataBase";

export type AuthorizedSession = SongServer.Data.Session & {
    userType: "teacher" | "student"
};

/**
 * Base class for models.
 */
export default abstract class Model<TModel extends Model<TModel, TController>, TController extends Controller<TController>> {
    private _controller: TController;
    private _urlPath: string;
    private _logger: Logger;
    private _router: Router;

    public constructor(controller: TController, urlPath: string) {
        this._controller = controller;
        this._urlPath = urlPath;
        this._logger = new Logger(`SERVER~${urlPath.toUpperCase()}-VIEW`, true, true, "none");
        this._router = Router();
    }

    /** The path to the views folder */
    protected get viewPath(): string | null {
        return this.controller.viewsPath;
    }

    /** The logger for the model */
    public get logger(): Logger {
        return this._logger;
    }

    /** 
     * The url path of the model.
     * @virtual
     */
    public get urlPath(): string {
        return this._urlPath;
    }

    public get app(): express.Express {
        return this.controller.app;
    }

    public get controller(): TController {
        return this._controller;
    }

    public get userDatabase(): UserDataBase {
        return this.controller.userDatabase;
    }

    public get classroomDatabase(): ClassroomDataBase {
        return this.controller.classroomDatabase;
    }

    public get playlistDatabase(): PlaylistDataBase {
        return this.controller.playlistDatabase;
    }

    public get sessionDatabase(): SessionDataBase {
        return this.controller.sessionDatabase;
    }


    /**
     * Performs authorization.
     */
    protected async authorize(token: string | null | undefined): Promise<SongServer.Data.Session> {
        if (token == null) {
            throw new Error("A token is required");
        }

        let session: SongServer.Data.Session;
        try {
            session = await this.sessionDatabase.get(token);
        }
        catch (err) {
            throw new Error("Invalid auth token");
        }

        // potentially implement cooldowns here maybe i dunno
        return session;
    }

    protected async authorizeFromRequest(req: Request): Promise<SongServer.Data.Session> {
        let authorization = req.headers.authorization;
        if (authorization == null) {
            throw new Error("An authorization header is required for this route");
        }

        let authParts = authorization.split(" ", 2);
        if (authParts.length != 2) {
            throw new Error("2 parts are required for authorization");
        }

        let authType = authParts[0];
        if (authType !== "Basic") {
            throw new Error("Only basic authorization is supported");
        }

        let authToken = authParts[1];
        return await this.authorize(authToken);
    }

    /**
     * Gets the view path for the given file
     * @param file The file to get the view path of
     */
    public getViewPath(file: string): string {
        let viewPath = this.viewPath;
        if (viewPath == null) return "";
        return path.join(viewPath, file);
    }

    /**
     * Inits the model, adding it to the express app
     * @virtual
     */
    public init(): void {
        this.logger.debug("Initializing model routes...");

        let router = this._router;
        try {
            this.initRoutes(router);
        }
        catch (err) {
            this.logger.error(`Error initializing routes: ${(err as Error).stack}`);
        }

        // replace all \ with /
        let id = this.urlPath.replace(/\\/gi, "/");
        // add / if needed
        if (!id.startsWith("/")) {
            id = "/" + id;
        }

        this.app.use(id, router);
        this.logger.debug(`Initialized server router '${id}'`);
    }

    /**
     * Initializes the router.
     * @param router The router to use.
     */
    protected abstract initRoutes(router: express.Router): void;
}
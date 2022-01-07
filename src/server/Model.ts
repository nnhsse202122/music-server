import express, { Router } from "express";
import Controller from "./Controller";
import Logger from "../util/Logger";
import path from "path";

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

        let id = "/" + this.urlPath;
        this.app.use(id, router);
        this.logger.debug(`Initialized server router '${id}'`);
    }

    /**
     * Initializes the router.
     * @param router The router to use.
     */
    protected abstract initRoutes(router: express.Router): void;
}
import express from "express";
import Model from "./Model";
import Server from "./Server";
import ClassroomDataBase from "../database/instance/ClassroomDataBase";
import UserDataBase from "../database/instance/UserDataBase";
import PlaylistDataBase from "../database/instance/PlaylistDataBase";
import SessionDataBase from "../database/instance/SessionDataBase";
import { OAuth2Client } from "google-auth-library";

/**
 * The base class for any controller.
 */
export default abstract class Controller<TController extends Controller<TController>> {
    private _models: Model<any, TController>[];
    private _viewsPath: string | null;
    private _server: Server;

    /**
     * Initializes this instance of the controller
     * @param app The express application to use.
     */
    public constructor(server: Server, viewsPath: string | null = null) {
        this._server = server;
        this._models = [];
        this._viewsPath = viewsPath;
    }

    public get viewsPath(): string | null {
        return this._viewsPath;
    }

    public get server(): Server {
        return this._server;
    }

    /**
     * The express application this controller is for.
     */
    public get app(): express.Express {
        return this.server.app;
    }

    /**
     * The models this application holds.
     */
    public get models(): Model<any, TController>[] {
        // return copy of array using spread operator to prevent modification.
        // modification should be done through the 'addModel' method.
        return [...this._models];
    }

    // getters for accessing the databases
    public get classroomDatabase(): ClassroomDataBase {
        return this.server.classroomDatabase;
    }

    public get userDatabase(): UserDataBase {
        return this.server.userDatabase;
    }

    public get playlistDatabase(): PlaylistDataBase {
        return this.server.playlistDatabase;
    }

    public get sessionDatabase(): SessionDataBase {
        return this.server.sessionDatabase;
    }

    public get authClientID(): string {
        return this.server.authClientID;
    }

    public get authClient(): OAuth2Client {
        return this.authClient;
    }

    /**
     * Handles adding all models to the controller.
     */
    protected abstract loadModels(): void;

    /**
     * Adds the model to the controller
     * @param model The model to add.
     */
    protected addModel<TModel extends Model<TModel, TController>>(model: TModel): void {
        // maybe add checks here?
        this._models.push(model);
    }

    /**
     * Initializes this controller.
     */
    public init(): void {
        this.loadModels();

        // call init on each model
        this._models.forEach((model) => {
            model.logger.info("loading...");
            model.init();
        });
    }
}
import express from "express";
import Model from "./Model";

/**
 * The base class for any controller.
 */
export default abstract class Controller<TController extends Controller<TController>> {
    private _models: Model<any, TController>[];
    private _app: express.Express;
    private _viewsPath: string | null;

    /**
     * Initializes this instance of the controller
     * @param app The express application to use.
     */
    public constructor(app: express.Express, viewsPath: string | null = null) {
        this._app = app;
        this._models = [];
        this._viewsPath = viewsPath;
    }

    public get viewsPath(): string | null {
        return this._viewsPath;
    }

    /**
     * The express application this controller is for.
     */
     public get app(): express.Express {
        return this._app;
    }

    /**
     * The models this application holds.
     */
    public get models(): Model<any, TController>[] {
        // return copy of array using spread operator to prevent modification.
        // modification should be done through the 'addModel' method.
        return [...this._models];
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
            model.init();
        });
    }
}
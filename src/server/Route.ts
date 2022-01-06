import Model from "./Model";
import Controller from "./Controller";

type ExtractTheController<C> = C extends Controller<infer F> ? F : never;
type ControllerFromModel<TModel> = TModel extends Model<any, infer C> ? ExtractTheController<C> : never;

export default abstract class Route<TModel extends Model<TModel, TController>, TController extends Controller<TController> = ControllerFromModel<TModel>> {
    
    private _model: TModel;

    public constructor(model: TModel) {
        this._model = model;
    }

    public get model(): TModel {
        return this._model;
    }

    public get controller(): TController {
        return this.model.controller;
    }
}
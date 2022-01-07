import Model from "../Model";
import APIController from "./APIController";
import path from "path";
import { u32 as uint } from "typed-numbers";

export abstract class APIModel<TModel extends APIModel<TModel>> extends Model<TModel, APIController> {
    
    private _apiVersion: uint;

    public constructor(controller: APIController, urlPath: string);
    public constructor(controller: APIController, urlPath: string, apiVersion: number);
    public constructor(controller: APIController, urlPath: string, apiVersion: uint);
    public constructor(controller: APIController, urlPath: string, apiVersion?: number) {
        super(controller, urlPath);
        this._apiVersion = uint(apiVersion ?? controller.latestAPIVersion);
    }

    /** 
     * Returns the API Version allowed by the model. e.g, version 1 would require the url `/api/v1/...`, and version 2
     * would require the url `/api/v2/...`
     */
    public get apiVersion(): uint {
        return this._apiVersion;
    }

    public override get urlPath(): string {
        return path.join("/api/v" + this._apiVersion, super.urlPath);
    }
}
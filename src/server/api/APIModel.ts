import Model from "../Model";
import APIController from "./APIController";
import path from "path";
import { Response } from "express";
import { u32 as uint } from "typed-numbers";
import DataBase from "../../database/DataBase";

export type APIResponseInfo<TResponse> = Promise<TResponse & {
    status?: number
}>;
export abstract class APIModel<TModel extends APIModel<TModel>> extends Model<TModel, APIController> {
    
    private _apiVersion: uint;

    public constructor(controller: APIController, urlPath: string);
    public constructor(controller: APIController, urlPath: string, apiVersion: number);
    public constructor(controller: APIController, urlPath: string, apiVersion: uint);
    public constructor(controller: APIController, urlPath: string, apiVersion?: number) {
        super(controller, urlPath);
        this._apiVersion = uint(apiVersion ?? controller.latestAPIVersion);
    }

    public async handleRes<T>(res: Response, a: APIResponseInfo<SongServer.API.Responses.APIResponse<T>>): Promise<void> {
        let result = await a;
        if (!result.success) {
            if (result.status != null) {
                res = res.status(result.status);
            }
    
            res.send({
                "success": false,
                "message": result.message
            });
        }
        else {
            res.send({
                "success": true,
                "data": result.data
            });
        }
    }

    public get userDatabase(): DataBase<string, SongServer.Data.User> {
        return this.controller.userDatabase;
    }

    public get classroomDatabase(): DataBase<string, SongServer.Data.Classroom> {
        return this.controller.classroomDatabase;
    }

    public get playlistDatabase(): DataBase<string, SongServer.Data.SongPlaylist> {
        return this.controller.playlistDatabase;
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
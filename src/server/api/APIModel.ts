import Model from "../Model";
import APIController from "./APIController";
import path from "path";
import { Request, Response } from "express";
import { u32 as uint } from "typed-numbers";

export type APIResponseInfo<TResponse> = Promise<TResponse & ({
    success: false,
    status: number
} | {
    success: true
})>;

export type GottenSessionInfo<T> = {
    is_response: true,
    response: T & ({
        success: false,
        status: number,
        message: string
    } | {
        success: true
    })
} | {
    is_response: false,
    session: SongServer.Data.Session,
    user: SongServer.Data.User
};

export abstract class APIModel<TModel extends APIModel<TModel>> extends Model<TModel, APIController> {
    
    private _apiVersion: uint;

    public constructor(controller: APIController, urlPath: string);
    public constructor(controller: APIController, urlPath: string, apiVersion: number);
    public constructor(controller: APIController, urlPath: string, apiVersion: uint);
    public constructor(controller: APIController, urlPath: string, apiVersion?: number) {
        super(controller, urlPath);
        this._apiVersion = uint(apiVersion ?? controller.latestAPIVersion);
    }

    protected async _verifySession<T>(req: Request): Promise<GottenSessionInfo<T>> {
        let session: SongServer.Data.Session;
        try {
            session = await this.authorizeFromRequest(req);
        }
        catch (err) {
            let message: string;
            if (err instanceof Error) {
                message = err.message;
            }
            else {
                message = new String(err) as string;
            }

            return {
                "is_response": true,
                "response": {
                    "success": false,
                    "message": "Error whilst authorizing: " + message,
                    "status": 403
                }
            };
        }

        let user: SongServer.Data.User;
        try {
            user = await this.userDatabase.get(session.email);
        }
        catch(err) {
            // err is type any because promises can reject with any value.
            // check if it's an actual error object
            if (err instanceof Error) {
                // send fail api response
                return {
                    "is_response": true,
                    "response": {
                        "success": false,
                        "message": "Error: " + err.message,
                        "status": 404
                    }
                };
            }
            // otherwise convert to string
            let message = new String(err);

            // send fail api response
            return {
                "is_response": true,
                "response": {
                    "success": false,
                    "status": 404,
                    "message": message as string
                }
            }
        }

        return {
            "is_response": false,
            "session": session,
            "user": user
        }
    }

    protected _bodyFieldRequired(name: string, status: number = 400): { success: false, message: string, status: number } {
        return {
            "success": false,
            "message": `The field '${name}' on the json body is required`,
            "status": status
        };
    }

    protected _invalidBodyFieldType(name: string, fieldTypes: ("string" | "boolean" | "null" | "number" | "integer" | "object")[], status: number = 400): { success: false, message: string, status: number } {
        let types: string;
        if (fieldTypes.length === 0) {
            types = "unknown";
        }
        else if (fieldTypes.length === 1) {
            types = fieldTypes[0];
        }
        else if (fieldTypes.length === 2) {
            types = fieldTypes[0] + " or " + fieldTypes[1];
        }
        else {
            types = fieldTypes.map((f, i, a) => {
                if (i + 1 === a.length) {
                    return "or " + f;
                }
                return f;
            }).join(", ");
        }
        let isAn = ['a', 'e', 'i', 'o', 'u'].includes(types.toLowerCase().charAt(0));
        return {
            "success": false,
            "message": `The field '${name}' on the json body must be a${(isAn ? "n" : "")} ${types}`,
            "status": status
        };
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
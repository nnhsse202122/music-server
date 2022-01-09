import Controller from "../Controller";
import express from "express";
import APIController from "../api/APIController";
import path from "path";
import AuthModel from "./routes/Auth";
import DashboardModel from "./routes/Dashboard";
import HomeModel from "./routes/Home";

export const VALID_DISTRICTS: string[] = ["naperville203"];
// todo: add start and end regex tag checking
export const VALID_EMAIL_REGEX = new RegExp(`([a-zA-Z0-9_]+)@(stu\\.)?(${VALID_DISTRICTS.join("|")})\\.org`);


export default class WebController extends Controller<WebController> {

    private _apiController: APIController;

    public constructor(app: express.Express, apiController: APIController) {
        super(app, path.join(
            // /
            path.basename(
                // /src
                path.basename(
                    // /src/server
                    path.basename(
                        // /src/server/web
                        __dirname))),
            "views"));
        this._apiController = apiController;
    }

    public get apiController(): APIController {
        return this._apiController;
    }

    protected override loadModels(): void {
        
    }
}
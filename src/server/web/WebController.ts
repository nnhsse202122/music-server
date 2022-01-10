import Controller from "../Controller";
import express from "express";
import APIController from "../api/APIController";
import path from "path";
import AuthModel from "./routes/AuthModel";
import DashboardModel from "./routes/Dashboard";
import HomeModel from "./routes/Home";
import Server from "../Server";

export default class WebController extends Controller<WebController> {

    private _apiController: APIController;

    public constructor(server: Server, apiController: APIController) {
        super(server);
        this._apiController = apiController;
    }

    public get apiController(): APIController {
        return this._apiController;
    }

    protected override loadModels(): void {
        this.addModel(new HomeModel(this));
        this.addModel(new DashboardModel(this));
        this.addModel(new AuthModel(this));
    }
}
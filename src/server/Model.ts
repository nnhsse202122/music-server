import express, { Router } from "express";
import Controller from "./Controller";
import Route from "./Route";
import Logger, { LogLevel } from "../util/Logger";
import path from "path";

/**
 * Base class for models.
 */
export default abstract class Model<TModel extends Model<TModel, TController>, TController extends Controller<TController>> {
    private _controller: TController;
    private _routes: Route<TModel, TController>[];
    private _id: string;
    private _logger: Logger;

    public constructor(controller: TController, id: string) {
        this._controller = controller;
        this._routes = [];
        this._id = id;
        this._logger = new Logger("VIEW~" + this.id.toUpperCase(), true, true, "none");
    }

    protected get viewPath(): string | null {
        let views = this.controller.viewsPath;
        if (views == null) return null;
        return path.join(views, this.id);
    }

    public get id(): string {
        return this._id;
    }

    public get app(): express.Express {
        return this.controller.app;
    }

    public get controller(): TController {
        return this._controller;
    }

    public init(): void {
        //
    }
}
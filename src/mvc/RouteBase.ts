import { Request, Response } from "express";
import ServerInstance from "../ServerInstance";
import Logger from "../util/logging/Logger";
import { Controller } from "./Controller";
import IRoute from "./IRoute";
import ModelBase from "./ModelBase";
import RequestMethod from "./requests/RequestMethod";

abstract class RouteBase<TModel extends ModelBase<TController>, TController extends Controller> implements IRoute {
    private readonly m_model: TModel;
    private readonly m_method: RequestMethod;

    public get model(): TModel {
        return this.m_model;
    }

    public get method(): RequestMethod {
        return this.m_method;
    }

    public get logger(): Logger {
        return this.model.logger;
    }

    public get controller(): TController {
        return this.model.controller;
    }

    public get server(): ServerInstance {
        return this.model.server;
    }

    protected constructor(model: TModel, method: RequestMethod) {
        this.m_model = model;
        this.m_method = method;
    }

    public abstract handle(req: Request, res: Response): Promise<void>;
}

export default RouteBase;
import { Request, Response } from "express";
import ServerInstance from "../ServerInstance";
import Logger from "../util/logging/Logger";
import { Controller } from "./Controller";
import IRoute from "./IRoute";
import RequestMethod from "./requests/RequestMethod";

function validateBasePath(route: string | null): string {
    if (route == null) {
        throw new Error("ArgumentException: route provided must not be null.");
    }
    route = route.trim();
    if (route.length === 0) {
        return "";
    }

    if (route.charAt(0) === '/') {
        route = route.substring(1);
    }

    if (route.length === 0) {
        return "";
    }

    if (route.charAt(route.length - 1) === '/') {
        route = route.substring(0, route.length - 1);
    }

    if (route.length === 0) {
        return "";
    }

    return route;
}

abstract class ModelBase<TController extends Controller> {
    private readonly m_path: string;
    private readonly m_controller: TController;
    private readonly m_logger: Logger;
    private readonly m_routes: Map<RequestMethod, IRoute>;
    private readonly m_id: string;

    public get logger(): Logger {
        return this.m_logger;
    }

    public get controller(): TController {
        return this.m_controller;
    }

    public get path(): string {
        return "/" + this.m_path;
    }

    public get id(): string {
        return this.m_id;
    }

    public get server(): ServerInstance {
        return this.controller.server;
    }

    protected constructor(controller: TController, path: string);
    protected constructor(controller: TController, path: string, id: string);
    protected constructor(controller: TController, path: string, id: string | null);

    protected constructor(controller: TController, path: string, id: string | null = null) {
        this.m_path = validateBasePath(path);
        if (id === null) {
            id = this.m_path.length === 0 ? "HOME" : this.m_path.replace("/", ":");
        }

        this.m_id = id;
        this.m_controller = controller;
        this.m_routes = new Map();
        this.m_logger = new Logger("SERVER~" + id.toUpperCase());
    }

    public get routes(): IRoute[] {
        return [...this.m_routes.values()];
    }

    public abstract initialize(): void;

    protected addRoute(route: IRoute): void {
        if (this.m_routes.has(route.method)) {
            throw new Error(`InvalidOperationException: A route with method ${route.method} already exists`);
        }

        this.logger.info(`Adding route for path '${this.path}' with method ${RequestMethod[route.method]}`);
        this.m_routes.set(route.method, route);
    }

    public async handle(req: Request, res: Response): Promise<boolean> {
        this.m_logger.debug("handle request at url " + req.url);
        
        // warn: Cannot convert method to enum implicitly.
        // @ts-ignore
        let method: RequestMethod = RequestMethod[req.method];

        // warn: Cannot implicitly map Dictionary<RequestMethod, IRoute>.TryGetValue to Map<RequestMethod, IRoute>.
        let route: IRoute | null = null;
        if (this.m_routes.has(method)) {
            route = this.m_routes.get(method)!;
            await route.handle(req, res);
            return true;
        }
        return false;
    }
}

export default ModelBase;
import APIController from "../../api/APIController";
import ModelBase from "../ModelBase";
import APIRoute from "./APIRoute";


export default abstract class APIEndpoint extends ModelBase<APIController> {
    private _version: number;
    private m_initialized: boolean;

    public constructor(controller: APIController, path: string, id: string, version: number) {
        if (path.startsWith("/")) path = path.substring(1);
        super(controller, `/api/v${version}/${path}`, id);
        this.m_initialized = false;

        this._version = version;
    }

    public get apiVersion(): number {
        return this._version;
    }

    public get routes(): APIRoute<any, any>[] {
        return super.routes as APIRoute<any, any>[];
    }

    protected addRoute<TData, T extends APIEndpoint>(route: APIRoute<TData, T>): void {
        super.addRoute(route);
    }

    public override initialize(): void {
        if (!this.m_initialized) {
            this.m_initialized = true;

            this.setup();
        }
    }

    /** @virtual */
    protected setup(): void {

    }

}
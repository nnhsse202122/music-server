import ModelBase from "../ModelBase";
import WebController from "../../web/WebController";
import WebRoute from "./WebRoute";

abstract class WebModel extends ModelBase<WebController> {
    private m_initialized: boolean;

    protected constructor(controller: WebController, path: string);
    protected constructor(controller: WebController, path: string, id: string);
    protected constructor(controller: WebController, path: string, id: string | null);

    protected constructor(controller: WebController, path: string, id: string | null = null) {
        super(controller, path, id);
        this.m_initialized = false;
    }

    public get routes(): WebRoute<any>[] {
        return super.routes as WebRoute<any>[];
    }

    protected addRoute<T extends WebModel>(route: WebRoute<T>): void {
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

export default WebModel;
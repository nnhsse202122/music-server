import ServerInstance from "../ServerInstance";
import ModelBase from "./ModelBase";


export abstract class Controller {
    private readonly m_models: ModelBase<any>[];
    private readonly m_server: ServerInstance;

    protected constructor(server: ServerInstance) {
        this.m_models = [];
        this.m_server = server;
    }

    public get server(): ServerInstance {
        return this.m_server;
    }

    public get models(): ModelBase<any>[] {
        return [...this.m_models];
    }

    protected addModel(modelType: new (controller: any) => ModelBase<any>): void {
        this.m_models.push(new modelType(this));
    }

    public abstract createModels(): void;
}
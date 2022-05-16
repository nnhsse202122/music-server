import { Controller } from "../mvc/Controller";
import WebModel from "../mvc/web/WebModel";
import ServerInstance from "../ServerInstance";
import AuthModel from "./models/AuthModel";
import ClassesModel from "./models/ClassesModel";
import ClassModel from "./models/ClassModel";
import HomeModel from "./models/HomeModel";
import LoginModel from "./models/LoginModel";
import LogoutModel from "./models/LogoutModel";
import SongsModel from "./models/SongsModel";


export default class WebController extends Controller {
    public constructor(server: ServerInstance) {
        super(server);
    }

    public override createModels(): void {
        this.addModel(HomeModel);
        this.addModel(ClassesModel);
        this.addModel(ClassModel);
        this.addModel(AuthModel);
        this.addModel(LoginModel);
        this.addModel(LogoutModel);
        this.addModel(SongsModel);
    }

    protected addModel<TModel extends WebModel>(modelType: new (controller: WebController) => TModel): void {
        super.addModel(modelType);
    }
}
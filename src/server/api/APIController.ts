import Controller from "../Controller";
import { u32 as uint } from "typed-numbers"; // unsigned integer (0-2^32)
import ClassroomModel from "./routes/Classroom";
import AuthModel from "./routes/Auth";
import YoutubeModel from "./routes/Youtube";
import PlaylistModel from "./routes/Playlist";
import Server from "../Server";

export default class APIController extends Controller<APIController> {

    private _latestAPIVersion: uint; // unsigned integer (0 - 2^32)

    public constructor(server: Server, latestAPIVersion: number);
    public constructor(server: Server, latestAPIVersion: uint);
    public constructor(server: Server, latestAPIVersion: number) {
        super(server, null);
        this._latestAPIVersion = uint(latestAPIVersion);
    }

    /** The latest API Version available */
    public get latestAPIVersion(): uint {
        return this._latestAPIVersion;
    }

    // override and implement abstract method
    protected override loadModels(): void {
        this.addModel(new ClassroomModel(this));
        this.addModel(new AuthModel(this));
        this.addModel(new YoutubeModel(this));
        this.addModel(new PlaylistModel(this));
    }

}
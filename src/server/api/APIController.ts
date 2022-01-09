import { OAuth2Client } from "google-auth-library";
import express from "express";
import Controller from "../Controller";
import { u32 as uint } from "typed-numbers"; // unsigned integer (0-2^32)
import ClassroomModel from "./routes/Classroom";
// import AuthModel from "./routes/Auth";
import YoutubeModel from "./routes/Youtube";
import DataBase from "../../database/DataBase";
import SimpleJSONDataBase from "../../database/SimpleJSONDataBase";
import PlaylistModel from "./routes/Playlist";

export default class APIController extends Controller<APIController> {

    private _authClient: OAuth2Client;
    private _latestAPIVersion: uint; // unsigned integer (0 - 2^32)
    private _authClientID: string;

    private _classroomDB: DataBase<string, SongServer.Data.Classroom>;
    private _userDB: DataBase<string, SongServer.Data.User>;
    private _playlistDB: DataBase<string, SongServer.Data.SongPlaylist>;

    public constructor(app: express.Express, authClientID: string, latestAPIVersion: number);
    public constructor(app: express.Express, authClientID: string, latestAPIVersion: uint);
    public constructor(app: express.Express, authClientID: string, latestAPIVersion: number) {
        super(app, null);
        this._authClientID = authClientID;
        this._authClient = new OAuth2Client(authClientID);
        this._latestAPIVersion = uint(latestAPIVersion);

        // for now use json databases, but we should add the replit database soon...
        this._classroomDB = new SimpleJSONDataBase();
        this._userDB = new SimpleJSONDataBase();
        this._playlistDB = new SimpleJSONDataBase();
    }

    // getters for accessing the databases
    public get classroomDatabase(): DataBase<string, SongServer.Data.Classroom> {
        return this._classroomDB;
    }

    public get userDatabase(): DataBase<string, SongServer.Data.User> {
        return this._userDB;
    }

    public get playlistDatabase(): DataBase<string, SongServer.Data.SongPlaylist> {
        return this._playlistDB;
    }

    /** The latest API Version available */
    public get latestAPIVersion(): uint {
        return this._latestAPIVersion;
    }

    public get authClientID(): string {
        return this._authClientID;
    }

    public get authClient(): OAuth2Client {
        return this._authClient;
    }

    // override and implement abstract method
    protected override loadModels(): void {
        this.addModel(new ClassroomModel(this));
        //this.addModel(new AuthModel(this));
        this.addModel(new YoutubeModel(this));
        this.addModel(new PlaylistModel(this));
    }

}
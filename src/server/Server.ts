import express, { Express } from "express";
import cookies from "cookie-parser";
import { OAuth2Client } from "google-auth-library";
import ClassroomDataBase from "../database/instance/ClassroomDataBase";
import PlaylistDataBase from "../database/instance/PlaylistDataBase";
import SessionDataBase from "../database/instance/SessionDataBase";
import UserDataBase from "../database/instance/UserDataBase";
import APIController from "./api/APIController";
import WebController from "./web/WebController";
import path from "path";

export const VALID_DISTRICTS: string[] = ["naperville203"];
// todo: add start and end regex tag checking
export const VALID_EMAIL_REGEX = new RegExp(`^([a-zA-Z0-9_]+)@(stu\\.)?(${VALID_DISTRICTS.join("|")})\\.org$`);

export function getRoleFromEmail(email: string): SongServer.API.UserType | "invalid" {
    let valid = false;
    let role = email.replace(VALID_EMAIL_REGEX, (full, p1, stu, p2) => {
        valid = true;
        if (stu != null && new String(stu).length > 0) {
            return "student";
        }
        return "teacher";
    }) as SongServer.API.UserType;

    if (valid) {
        return role;
    }
    else {
        return "invalid";
    }
}

export default class Server {

    private _app: Express;
    private _authClientID: string;
    private _authClient: OAuth2Client; 
    private _classroomDB: ClassroomDataBase;
    private _userDB: UserDataBase;
    private _playlistDB: PlaylistDataBase;
    private _sessionDB: SessionDataBase;

    public constructor(authClientID: string) {
        this._app = express();
        this._authClient = new OAuth2Client(authClientID);
        this._authClientID = authClientID;

        this._classroomDB = new ClassroomDataBase();
        this._userDB = new UserDataBase();
        this._playlistDB = new PlaylistDataBase();
        this._sessionDB = new SessionDataBase(this._authClient, this._authClientID);

        let apiController = new APIController(this, 1);
        let webController = new WebController(this, apiController);

        this.app.use(cookies("keyboard-cat"));
        this.app.use(express.json());

        apiController.init();
        webController.init();

        let viewsFolder = path.join(
            path.resolve(__dirname, "../", "../"),
        "views");
        console.log(viewsFolder);

        this.app.set("views", path.join(
                path.resolve(__dirname, "../", "../"),
            "views"));
        this.app.set("view engine", "ejs");
        this.app.use("/resources", express.static(path.join(
            // /src
            path.resolve(__dirname, "../", "../"),
        "resources")));
        this.app.use("/resources/scripts", express.static(path.join(__dirname, "client-scripts")));
    }

    public get app(): Express {
        return this._app;
    }

    public get classroomDatabase(): ClassroomDataBase {
        return this._classroomDB;
    }

    public get userDatabase(): UserDataBase {
        return this._userDB;
    }

    public get playlistDatabase(): PlaylistDataBase {
        return this._playlistDB;
    }

    public get sessionDatabase(): SessionDataBase {
        return this._sessionDB;
    }

    public get authClient(): OAuth2Client {
        return this._authClient;
    }

    public get authClientID(): string {
        return this._authClientID;
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log("Server is online!");
        })
    }
}
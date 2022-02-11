import YoutubeCache from "./YoutubeCache";
import UserDataBase from "./UserDataBase";
import SessionsDataBase from "./SessionsDataBase";
import ClassroomDataBase from "./ClassroomDataBase";
import PlaylistDataBase from "./PlaylistDataBase";
import mongoose from "mongoose";


export default class DataBaseManager {
    
    private readonly _ytCache: YoutubeCache;
    private readonly _users: UserDataBase;
    private readonly _classrooms: ClassroomDataBase;
    private readonly _sessions: SessionsDataBase;
    private readonly _playlists: PlaylistDataBase;

    public constructor() {
        let apiKey = process.env.API_KEY;
        if (apiKey == null) throw new Error("Failed to fetch api key for youtube cache");
        this._ytCache = new YoutubeCache(apiKey);

        this._playlists = new PlaylistDataBase();
        this._users = new UserDataBase();
        this._sessions = new SessionsDataBase();
        this._classrooms = new ClassroomDataBase();
    }

    public async connect(): Promise<void> {
        if (process.env.MONGO_URI == null) {
            throw new Error("No mongo db connection uri specified!");
        }

        let connection = await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo db connected!");
    }

    public get yt(): YoutubeCache {
        return this._ytCache;
    }

    public get users(): UserDataBase {
        return this._users;
    }

    public get sessions(): SessionsDataBase {
        return this._sessions;
    }

    public get classrooms(): ClassroomDataBase {
        return this._classrooms;
    }

    public get playlists(): PlaylistDataBase {
        return this._playlists;
    }
};
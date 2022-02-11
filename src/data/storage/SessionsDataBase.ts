import Session from "../sessions/Session";
import CollectionDataBase from "./CollectionDataBase";
import ISession from "./interfaces/ISession";
import SessionsModel from "./models/SessionsModel";
import { i32 as int, i64 as long } from "typed-numbers";
import CreatedSession from "../sessions/CreatedSession";
import { OAuth2Client } from "google-auth-library";
import { getRoleFromEmail } from "../../util/RoleUtil";
import Role from "../users/Role";

function dbSessionToSession(session: ISession): Session {
    return {
        "accessToken": session.accessToken,
        "email": session.email,
        "expiresAfter": session.expiresAfter,
        "name": session.name,
        "id": session._id as string
    };
}

function sessionToDBSession(session: Session): ISession {
    return new SessionsModel({
        "accessToken": session.accessToken,
        "email": session.email,
        "expiresAfter": session.expiresAfter,
        "name": session.name,
        "_id": session.id
    });
}

function updateDBSession(session: Session, dbSession: ISession): void {
    dbSession.accessToken = session.accessToken;
    dbSession.email = session.email;
    dbSession.expiresAfter = session.expiresAfter;
    dbSession.name = session.name;
}

export default class SessionsDataBase extends CollectionDataBase<string, Session> {

    private readonly _oauthClient: OAuth2Client;

    public constructor() {
        super();

        this._oauthClient = new OAuth2Client({
            "clientId": process.env.OAUTH_CLIENT_ID ?? undefined,
            "clientSecret": process.env.OAUTH_CLIENT_SECRET ?? undefined,
        });
    }
    
    private async _get(id: string): Promise<ISession> {
        let fetchedSession = await SessionsModel.findById(id).exec();
        if (fetchedSession === null) {
            throw new Error("No session with id '" + id + "'");
        }

        return fetchedSession;
    } 

    public async get(id: string): Promise<Session> {
        return dbSessionToSession(await this._get(id));
    }

    public async add(id: string, session: Session): Promise<boolean> {
        if (await this.contains(id)) return false;
        let s = sessionToDBSession(session);
        await s.save();
        return true;
    }
    public async set(id: string, session: Session): Promise<boolean> {
        if (!await this.contains(id)) return false;
        let sessionDB = await this._get(id);

        updateDBSession(session, sessionDB);
        await sessionDB.save();

        return true;
    }
    public async contains(id: string): Promise<boolean> {
        return (await SessionsModel.findById(id).exec()) != null;
    }
    public async delete(id: string): Promise<boolean> {
        if (!await this.contains(id)) return false;
        await SessionsModel.findByIdAndDelete(id).exec();
        return !await this.contains(id);
    }

    private generateSessionID(length: int = int(64)) {
        let sessionID = "";
        const GEN_KEY = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789_-";
        for (let count = 0; count < length; count++) {
            // add random char of GEN_KEY to sessionID
            sessionID += GEN_KEY.charAt(Math.floor(Math.random() * GEN_KEY.length));
        }

        return sessionID;
    }
    
    public async createSession(accessToken: string): Promise<CreatedSession> {
        let loginTicket = await this._oauthClient.verifyIdToken({
            idToken: accessToken
        });

        let payload = loginTicket.getPayload();
        if (payload == null) {
            throw new Error("No payload");
        }
        if (payload.email == null) {
            throw new Error("Payload doesn't contain an email");
        }
        if (payload.name == null) {
            throw new Error("Payload doesn't contain a name");
        }
        if (payload.email == null) {
            throw new Error("Payload doesn't contain an email");
        }

        let role = getRoleFromEmail(payload.email);
        if (role == null) {
            throw new Error("Unauthorized email");
        }

        // imagine calculating this constant and writing it in hex. Couldn't be me.
        const ONE_DAY = 1000 * 60 * 60 * 24;
        // mom said it's my turn to do Date.now()
        let expiresAt = Date.now() + ONE_DAY;

        // generate a new random session id. prob a better way to do this, but works for
        // now. Will worry when goes into production
        let sessionID: string;
        do
        {
            sessionID = this.generateSessionID();
        }
        while (await this.contains(sessionID));

        // general session stuff
        let session: Session = {
            "accessToken": accessToken,
            "email": payload.email,
            "name": payload.name,
            "expiresAfter": expiresAt as int,
            "id": sessionID
        }

        // add the session
        await this.add(sessionID, session);

        return {
            "email": session.email,
            "expires_at": session.expiresAfter as int,
            "name": session.name,
            "token": session.id,
            "profile_url": payload.picture ?? ""
        };
    }
}
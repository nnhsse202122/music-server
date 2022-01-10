import { OAuth2Client } from "google-auth-library";
import SimpleJSONDataBase from "../SimpleJSONDataBase";

export default class SessionDataBase extends SimpleJSONDataBase<string, SongServer.Data.Session> {

    private authClient: OAuth2Client;
    private authClientID: string;

    public constructor(authClient: OAuth2Client, authClientID: string) {
        super();

        this.authClient = authClient;
        this.authClientID = authClientID;
    }

    // todo: implement another way of generating session IDs
    private generateSessionID(length: number = 64): string {
        let sessionID: string = "";
        const GEN_KEY = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789_-";
        for (let count = 0; count < length; count++) {
            // add random char of GEN_KEY to sessionID
            sessionID += GEN_KEY.charAt(Math.floor(Math.random() * GEN_KEY.length))
        }
        return sessionID;
    }

    public async createSession(token: string): Promise<SongServer.API.CreatedSessionInfo> {
        let loginTicket = await this.authClient.verifyIdToken({
            "audience": this.authClientID,
            "idToken": token
        });

        let payload = loginTicket.getPayload();
        if (payload == null) {
            throw new Error("No payload found");
        }

        if (payload.email == null) {
            throw new Error("Payload doesn't contain email");
        }

        if (payload.name == null) {
            throw new Error("Payload doesn't contain a name");
        }

        // for now, have the session expire after 1 day
        let ONE_DAY = 1000 * 60 * 60 * 24;
        let expiresAt = Date.now() + ONE_DAY;

        let sessionID = this.generateSessionID();
        while (await this.contains(sessionID)) {
            sessionID = this.generateSessionID();
        }

        let session: SongServer.Data.Session = {
            "accessToken": token,
            "email": payload.email,
            "name": payload.name,
            "expiresAfter": expiresAt
        };

        await this.add(sessionID, session);
        return {
            "expires_at": expiresAt,
            "token": sessionID
        };
    }

    public override async get(key: string): Promise<SongServer.Data.Session> {
        let result = await super.get(key);
        if (result.expiresAfter < Date.now()) {
            await this.delete(key);
            throw new Error("Session expired");
        }

        return result;
    }

    public override async getOrDefault(key: string, defaultValue: SongServer.Data.Session): Promise<SongServer.Data.Session> {
        let result = await super.getOrDefault(key, defaultValue);
        if (result.expiresAfter < Date.now()) {
            await this.delete(key);
            return defaultValue;
        }

        return result;
    }

}
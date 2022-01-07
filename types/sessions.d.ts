import 'express-session';

declare module 'express-session' {
    interface SessionData {
        /** The token of the session */
        token: string
    }
}
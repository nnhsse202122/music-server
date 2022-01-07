import { OAuth2Client } from "google-auth-library";
import express from "express";
import Controller from "../Controller";
import { u32 as uint } from "typed-numbers"; // unsigned integer (0-2^32)

export default class APIController extends Controller<APIController> {

    private _authClient: OAuth2Client;
    private _latestAPIVersion: uint; // unsigned integer (0 - 2^32)
    private _authClientID: string;

    public constructor(app: express.Express, authClientID: string, latestAPIVersion: number);
    public constructor(app: express.Express, authClientID: string, latestAPIVersion: uint);
    public constructor(app: express.Express, authClientID: string, latestAPIVersion: number) {
        super(app, null);
        this._authClientID = authClientID;
        this._authClient = new OAuth2Client(authClientID);
        this._latestAPIVersion = uint(latestAPIVersion);
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
        throw new Error("Method not implemented.");
    }

}
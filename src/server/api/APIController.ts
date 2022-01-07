import { OAuth2Client } from "google-auth-library";
import express from "express";
import Controller from "../Controller";
import { u32 as uint } from "typed-numbers"; // unsigned integer (0-2^32)

export default class APIController extends Controller<APIController> {

    private _authClient: OAuth2Client;
    private _latestAPIVersion: uint; // unsigned integer (0 - 2^32)

    public constructor(app: express.Express, latestAPIVersion: number);
    public constructor(app: express.Express, latestAPIVersion: uint);
    public constructor(app: express.Express, latestAPIVersion: number) {
        super(app, null);
        this._latestAPIVersion = uint(latestAPIVersion);
        // todo: create auth client
    }

    /** The latest API Version available */
    public get latestAPIVersion(): uint {
        return this.latestAPIVersion;
    }

    public get authClientID(): string {
        // todo
    }

    public get authClient(): OAuth2Client {
        return this._authClient;
    }

    // override and implement abstract method
    protected override loadModels(): void {
        throw new Error("Method not implemented.");
    }

}
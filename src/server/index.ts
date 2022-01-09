import express from "express";
import session from "express-session";
import WebController from "./web/WebController";
import APIController from "./api/APIController";

let app = express();

const AUTH_CLIENT_ID = "430954870897-nqat6i8u9fbhsl4kdctnni162isherhh.apps.googleusercontent.com";

let apiController = new APIController(app, AUTH_CLIENT_ID, 1);
let webController = new WebController(app, apiController);


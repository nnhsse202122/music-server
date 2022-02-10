import { Request, Response } from "express";
import RequestMethod from "./requests/RequestMethod";


interface IRoute {
    method: RequestMethod;
    handle(req: Request, res: Response): Promise<void>
}

export default IRoute;
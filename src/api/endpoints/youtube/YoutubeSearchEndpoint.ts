import { Request } from "express";
import { YoutubeVideo } from "../../../data/storage/YoutubeCache";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import APIResponse from "../../responses/APIResponse";

class GetRoute extends APIRoute<YoutubeVideo[], YoutubeSearchEndpoint> {
    public constructor(endpoint: YoutubeSearchEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<YoutubeVideo[]>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }
    
        let query = req.query.q;
        if (Array.isArray(query)) {
            return this.fail("api.yt.search.invalid_query", {});
        }

        if (typeof query !== "string") {
            return this.fail("api.yt.search.invalid_query", {});
        }

        let search = await this.server.db.yt.search(query);
        if (search != null) {
            return this.success(search.results);
        }
        return this.fail("api.yt.search.not_found", { "query": query });
    }
}

export default class YoutubeSearchEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;

    public constructor(controller: APIController) {
        super(controller, "/yt/search", "yt-search", 1);

        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
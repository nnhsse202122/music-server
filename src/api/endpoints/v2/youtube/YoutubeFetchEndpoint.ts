import { Request } from "express";
import { YoutubeVideo } from "../../../../data/storage/YoutubeCache";
import APIEndpoint from "../../../../mvc/api/APIEndpoint";
import APIRoute from "../../../../mvc/api/APIRoute";
import RequestMethod from "../../../../mvc/requests/RequestMethod";
import APIController from "../../../APIController";
import APIResponse from "../../../responses/APIResponse";

class GetRoute extends APIRoute<YoutubeVideo, YoutubeFetchEndpoint> {

    public constructor(endpoint: YoutubeFetchEndpoint) {
        super(endpoint, RequestMethod.GET);
    }

    protected async doHandle(req: Request): Promise<APIResponse<YoutubeVideo>> {
        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let id = req.params.id;
        let video = await this.server.db.yt.fetch(id);
        if (video != null) {
            return this.success(video);
        }
        else {
            return this.fail("api.yt.video.not_found", { "id": id });
        }
    }
}

export default class YoutubeFetchEndpoint extends APIEndpoint {

    private readonly _get: GetRoute;

    public constructor(controller: APIController) {
        super(controller, "/yt/videos/:id", "yt-fetch", 2);

        this._get = new GetRoute(this);
    }

    protected setup(): void {
        this.addRoute(this._get);
    }
}
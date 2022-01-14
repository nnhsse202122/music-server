import SimpleJSONDataBase from "../SimpleJSONDataBase";
import { i32 as int } from "typed-numbers";
import { youtube, youtube_v3 } from "@googleapis/youtube";
import Logger from "../../util/Logger";
import colors from "colors/safe";
import DataBase from "../DataBase";

type SearchCache = {
    results: string[],
    count: int,
    etag: string
};

export type YoutubeSearch = {
    results: YoutubeVideo[],
    count: number,
    etag: string
}

export type YoutubeVideo = {
    title: string,
    id: string,
    etag: string
};

export default class YoutubeCache {
    private readonly _videoDB: DataBase<string, YoutubeVideo | null>;
    private readonly _searchDB: DataBase<string, SearchCache>;
    private readonly _logger: Logger;

    public constructor() {
        this._videoDB = new SimpleJSONDataBase();
        this._searchDB = new SimpleJSONDataBase();
        this._logger = new Logger("YT-CACHE", true, true, "none");
    }

    public async fetch(id: string): Promise<YoutubeVideo | null> {
        this._logger.debug("Fetching video with id " + colors.cyan(id));
        if (await this._videoDB.contains(id)) {
            this._logger.debug("Used cache!");
            return this._videoDB.get(id);
        }

        this._logger.debug("Not in cache, attempting to fetch from youtube.");
        let videos = await youtube("v3").videos.list({
            "part": ["snippet", "contentDetails", "statistics"],
            "id": [id],
            "key": process.env.KEY
        });

        if (videos.data.items == null) {
            await this._videoDB.add(id, null);
            return null;
        }

        if (videos.data.items.length == 0) {
            await this._videoDB.add(id, null);
            return null;
        }

        let firstVideo = videos.data!.items![0];

        let video: YoutubeVideo = {
            "etag": firstVideo.etag!,
            "id": firstVideo.id!,
            "title": firstVideo.snippet!.title!
        };
        await this._videoDB.add(video.id, video);
        this._logger.debug("Retreieved from youtube and cached...");
        return video;
    }

    public async search(query: string): Promise<YoutubeSearch> {
        this._logger.debug("Searching for videos with query " + colors.cyan(query));
        if (await this._searchDB.contains(query)) {
            this._logger.debug("Fetching from cache...");
            let searchInfo = await this._searchDB.get(query);
            let results: YoutubeVideo[] =[];
            for (let index = 0; index < searchInfo.count; index++) {
                let vid = await this._videoDB.get(searchInfo.results[index]);
                if (vid != null) results.push(vid);
            }
            return {
                "count": results.length,
                "etag": searchInfo.etag,
                "results": results
            };
        }
        this._logger.debug("Fetching from youtube");

        // fetch video from google api
        let videos = await youtube("v3").search.list({
            "part": ["snippet"],
            "type": ["video"],
            "videoCategoryId": "10", // 10 is music category. 
                                        // Look at https://developers.google.com/youtube/v3/docs/videoCategories/list
                                        // for more info
            "key": process.env.KEY,
            "maxResults": 3,
            "q": query
        });

        let newSearchInfo: SearchCache = {
            "count": int(videos.data.items!.length),
            "etag": videos.data!.etag!,
            "results": videos.data!.items!.map((v) => v.id!.videoId!)
        };
        let newResult: YoutubeSearch = {
            "count": newSearchInfo.count,
            "etag": newSearchInfo.etag,
            "results": videos.data!.items!.map((v) => {
                return {
                    "etag": v.etag!,
                    "id": v.id!.videoId!,
                    "title": v.snippet!.title!
                };
            })
        };
        for (let index = 0; index < newSearchInfo.count; index++) {
            let videoID = newSearchInfo.results[index];
            if (!await this._videoDB.contains(videoID)) {
                await this._videoDB.add(videoID, {
                    "etag": videos.data!.items![index].etag!,
                    "title": videos.data!.items![index].snippet!.title!,
                    "id": videoID,
                });
            }
        }
        this._logger.debug("Got search results!");

        await this._searchDB.add(query, newSearchInfo);
        return newResult;
    }
}
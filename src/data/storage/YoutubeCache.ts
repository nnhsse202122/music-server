import { youtube } from "@googleapis/youtube";
import { i64 as long, i32 as int } from "typed-numbers";
import Logger from "../../util/logging/Logger";

// 7 days
const VIDEO_EXPIRE_MS = 1000 * 60 * 60 * 24 * 7;
// 30 days
const SEARCH_EXPIRE_MS = 1000 * 60 * 60 * 24 * 30;

export type YoutubeVideo = {
    title: string,
    author: string,
    id: string
};

export type YoutubeSearch = {
    results: YoutubeVideo[],
    count: int,
    query: string
};

type RawVideoCache = {
    title: string,
    author: string,
    id: string,
    etag: string,
    expiresAt: long
};

type RawSearchCache = {
    results: string[],
    count: int,
    etag: string,
    expiresAt: long,
    query: string
};

class VideoCache {
    private readonly _data: RawVideoCache;
    private readonly _db: VideoDataBase;

    public constructor(data: RawVideoCache, db: VideoDataBase) {
        this._data = data;
        this._db = db;
    }

    public get expired(): boolean {
        return this.expiresAt < Date.now();
    }

    public get author(): string {
        return this._data.author;
    }

    public get title(): string {
        return this._data.title;
    }

    public get id(): string {
        return this._data.id;
    }

    public get etag(): string {
        return this._data.etag;
    }

    public get expiresAt(): long {
        return this._data.expiresAt;
    }

    public async refresh(): Promise<boolean> {
        let foundVideos = await youtube("v3").videos.list({
            "part": ["snippet", "status", "contentDetails"],
            "id": [this.id],
            "key": this._db.yt.apiKey
        });
        if (foundVideos.data.items != null) {
            let firstVideo = foundVideos.data.items[0];
            this._data.author = firstVideo.snippet!.channelTitle!;
            this._data.etag = firstVideo.etag!;
            this._data.expiresAt = long(Date.now() + VIDEO_EXPIRE_MS);
            this._data.id = firstVideo.id!;
            this._data.title = firstVideo.snippet!.title!;
            return await this._db.setData(this.id, this._data);
        }
        return false;
    }

    public toJSON(): YoutubeVideo {
        return {
            "author": this.author,
            "id": this.id,
            "title": this.title
        };
    }
}

class SearchCache {

    private readonly _data: RawSearchCache;
    private readonly _db: SearchDataBase;

    public constructor(data: RawSearchCache, db: SearchDataBase) {
        this._data = data;
        this._db = db;
    }

    public get expired(): boolean {
        return this.expiresAt < Date.now();
    }

    public get results(): string[] {
        return [...this._data.results];
    }

    public get count(): int {
        return this._data.count;
    }

    public get etag(): string {
        return this._data.etag;
    }

    public get expiresAt(): long {
        return this._data.expiresAt;
    }

    public get query(): string {
        return this._data.query;
    }

    public async refresh(): Promise<boolean> {
        let searchedVideos = await youtube("v3").search.list({
            "q": this.query,
            "videoCategoryId": "10", // 10 is music category. 
                                     // Look at https://developers.google.com/youtube/v3/docs/videoCategories/list
                                     // for more info
            "type": ["video"],
            "part": ["snippet"],
            "videoEmbeddable": "true",
            "maxResults": 3,
            "key": this._db.yt.apiKey
        });

        this._data.results = [];
        if (searchedVideos.data.items != null) {
            this._data.count = int(searchedVideos.data.items.length);
            for (let index = 0; index < searchedVideos.data.items.length; index++) {
                let searchedVideo = searchedVideos.data.items[index];

                this._data.results.push(searchedVideo.id!.videoId!);
                
                // @ts-ignore member visibility
                if (!await this._db.yt._videoDB.contains(searchedVideo.id!.videoId!)) {
                    // @ts-ignore member visibility
                    await this._db.yt._videoDB.add(searchedVideo.id!.videoId!, {
                        "etag": searchedVideo.etag!,
                        "id": searchedVideo.id!.videoId!,
                        "title": searchedVideo.snippet!.title!,
                        "author": searchedVideo.snippet!.channelTitle!,
                        "expiresAt": long(Date.now() + VIDEO_EXPIRE_MS)
                    });
                }
            }

            this._data.expiresAt = long(Date.now() + SEARCH_EXPIRE_MS);
            return true;
        }
        return false;
    }
}

// todo: migrate to mongodb
class VideoDataBase {

    private readonly _yt: YoutubeCache;
    private readonly _cache: Map<string, RawVideoCache | null>;

    public constructor(yt: YoutubeCache) {
        this._yt = yt;
        this._cache = new Map();
    }

    public get yt(): YoutubeCache {
        return this._yt;
    }

    public async add(id: string, data: RawVideoCache | null): Promise<boolean> {
        if (await this.contains(id)) return false;
        this._cache.set(id, data);
        return true;
    }

    public async put(id: string, data: RawVideoCache | null): Promise<boolean> {
        this._cache.set(id, data);
        return true;
    }

    public async get(id: string): Promise<VideoCache | null> {
        if (!await this.contains(id)) return null;
        let fetched = this._cache.get(id);
        if (fetched != null) {
            return new VideoCache(fetched, this);
        }
        return null;
    }

    public async setData(id: string, data: RawVideoCache | null): Promise<boolean> {
        if (!await this.contains(id)) return false;
        this._cache.set(id, data);
        return true;
    }

    public async contains(id: string): Promise<boolean> {
        return this._cache.has(id);
    }

    public async delete(id: string): Promise<boolean> {
        if (await this.contains(id)) {
            this._cache.delete(id);
            return true;
        }
        return false;
    }
}

class SearchDataBase {

    private readonly _yt: YoutubeCache;
    private readonly _cache: Map<string, RawSearchCache | null>;

    public constructor(yt: YoutubeCache) {
        this._yt = yt;
        this._cache = new Map();
    }

    public get yt(): YoutubeCache {
        return this._yt;
    }

    public async get(query: string): Promise<SearchCache | null> {
        if (!await this.contains(query)) return null;
        let fetched = this._cache.get(query);
        if (fetched != null) {
            return new SearchCache(fetched, this);
        }
        return null;
    }

    public async add(query: string, data: RawSearchCache | null): Promise<boolean> {
        if (await this.contains(query)) return false;
        this._cache.set(query, data);
        return true;
    }

    public async put(query: string, data: RawSearchCache | null): Promise<boolean> {
        this._cache.set(query, data);
        return true;
    }

    public async setData(query: string, data: RawSearchCache): Promise<boolean> {
        if (!await this.contains(query)) return false;
        this._cache.set(query, data);
        return true;
    }

    public async contains(query: string): Promise<boolean> {
        return this._cache.has(query);
    }

    public async delete(query: string): Promise<boolean> {
        if (await this.contains(query)) {
            this._cache.delete(query);
            return true;
        }
        return false;
    }
}

export default class YoutubeCache {

    private readonly _apiKey: string;
    private readonly _searchDB: SearchDataBase;
    private readonly _videoDB: VideoDataBase;
    private readonly logger: Logger;

    public constructor(apiKey: string) {
        this._apiKey = apiKey;
        this._searchDB = new SearchDataBase(this);
        this._videoDB = new VideoDataBase(this);
        this.logger = new Logger("YT-CACHE");
    }

    public get apiKey(): string {
        return this._apiKey;
    }

    public async fetch(id: string): Promise<YoutubeVideo | null> {
        this.logger.debug(`Fetching video with id '${id}'`);
        if (await this._videoDB.contains(id)) {
            this.logger.debug("Exists in cache! Fetching...");
            let video = await this._videoDB.get(id);
            if (video != null) {
                if (video.expired) {
                    this.logger.warn(`Video with id ${id} has expired! Refreshing...`);
                    await video.refresh();
                }

                return video.toJSON();
            }
            else {
                console.warn("Video was null in db!");
            }

        }

        this.logger.debug("Not in cache, fetching from youtube...");
        let foundVideos = await youtube("v3").videos.list({
            "part": ["snippet", "status", "contentDetails"],
            "id": [id],
            "key": this.apiKey
        });
        if (foundVideos.data.items != null) {
            let firstVideo = foundVideos.data.items[0];
            let data: RawVideoCache = {
                author: firstVideo.snippet!.channelTitle!,
                etag: firstVideo.etag!,
                expiresAt: long(Date.now() + VIDEO_EXPIRE_MS),
                id: firstVideo.id!,
                title: firstVideo.snippet!.title!
            };

            await this._videoDB.setData(data.id, data);
            return new VideoCache(data, this._videoDB).toJSON();
        }
        return null;
    }

    public async search(query: string): Promise<YoutubeSearch | null> {
        this.logger.debug(`Fetching search with query '${query}'`);
        if (await this._searchDB.contains(query)) {
            this.logger.debug("Exists in cache! Fetching...");
            let search = await this._searchDB.get(query);
            if (search != null) {
                if (search.expired) {
                    this.logger.warn(`Search with query '${query}' has expired! Refreshing...`);
                    await search.refresh();
                }

                let videos: YoutubeVideo[] = [];
                for (let index = 0; index < search.results.length; index++) {
                    let videoID = search.results[index];
                    let video = await this.fetch(videoID);
                    if (video != null) {
                        videos.push(video);
                    }
                }

                return {
                    "count": int(videos.length),
                    "query": search.query,
                    "results": videos
                }


            }
            else {
                console.warn("Search was null in db!");
            }

        }

        this.logger.debug("Not in cache, fetching from youtube...");
        let searchedVideos = await youtube("v3").search.list({
            "q": query,
            "videoCategoryId": "10", // 10 is music category. 
                                     // Look at https://developers.google.com/youtube/v3/docs/videoCategories/list
                                     // for more info
            "type": ["video"],
            "part": ["snippet"],
            "videoEmbeddable": "true",
            "maxResults": 3,
            "key": this.apiKey
        });

        let results: YoutubeVideo[] = [];
        if (searchedVideos.data.items != null) {
            for (let index = 0; index < searchedVideos.data.items.length; index++) {
                let searchedVideo = searchedVideos.data.items[index];

                results.push({
                    "id": searchedVideo.id!.videoId!,
                    "title": searchedVideo.snippet!.title!,
                    "author": searchedVideo.snippet!.channelTitle!,
                });
                
                if (!await this._videoDB.contains(searchedVideo.id!.videoId!)) {
                    await this._videoDB.add(searchedVideo.id!.videoId!, {
                        "etag": searchedVideo.etag!,
                        "id": searchedVideo.id!.videoId!,
                        "title": searchedVideo.snippet!.title!,
                        "author": searchedVideo.snippet!.channelTitle!,
                        "expiresAt": long(Date.now() + VIDEO_EXPIRE_MS)
                    });
                }
            }

            let data: RawSearchCache = {
                "count": int(results.length),
                "etag": searchedVideos.data.etag!,
                "expiresAt": long(Date.now() + SEARCH_EXPIRE_MS),
                "query": query,
                "results": results.map((r) => r.id)
            };

            await this._searchDB.add(data.query, data);

            return {
                "count": data.count,
                "results": results,
                "query": data.query
            };
        }
        return null;
    }
}
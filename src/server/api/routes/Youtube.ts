import { Router } from "express";
import APIController from "../APIController";
import { APIModel } from "../APIModel"
import { youtube, youtube_v3 } from "@googleapis/youtube";
import { GaxiosResponse } from "gaxios";
import colors from "colors/safe";
import YoutubeCache, { YoutubeSearch, YoutubeVideo } from "../../../database/instance/YoutubeCache";

export default class YoutubeModel extends APIModel<YoutubeModel> {
    private _cache: YoutubeCache;

    public constructor(controller: APIController) {
        // version 1
        super(controller, "yt", 1);
        this._cache = new YoutubeCache();
    }

    protected override initRoutes(router: Router): void {

        // will handle searching for a video using req.query.
        // returns the first 3 videos that match the specific query
        router.get("/videos", async (req, res) => {
            let query = req.query.query;
            if (query == null) {
                // send fail api response
                res.status(400).send({
                    "message": "A query query parameter is required!",
                    "success": false
                });

                return; // prevent other code from running
            }
            // make sure term is string
            if (typeof query !== "string") {
                // send fail api response
                res.status(400).send({
                    "message": "Query provided must not be an array. Only strings are accepted",
                    "success": false
                });

                return; // prevent other code from running
            }

            let search: YoutubeSearch;
            try {
                // fetch video from google api
                search = await this._cache.search(query);
            }
            // catch errors
            catch (err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    
                    // send fail api response
                    res.status(400).send({
                        "message": "Error fetching videos: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(400).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            let foundVideos = search.results; // ignore that items could be null
            this.logger.debug(`Fetched ${search.count} videos. ${foundVideos.map((v) => 
                // map each video to a string representation, and join them
                `\n    [${colors.cyan(v.id)}] ${colors.yellow(v.title)}`).join("")}`);
            
            // convert the found video array to result array
            let result: SongServer.API.FetchedVideo[] = foundVideos.map((v) => {
                // map each item in video array to a fetched video item
                return {
                    "id": v.id, // use ! to tell typescript nobody cares that x or y could be undefined/null
                    "title": v.title
                };
            });
            
            // send success api response
            let response: SongServer.API.Responses.SearchVideosAPIResponse = {
                "success": true,
                "data": result
            };

            res.send(response);
        });

        // wacky :id syntax allows for extracting the ID passed
        // using req.params.id
        router.get("/videos/:id", async (req, res) => {
            this.logger.debug("Searching for video with id '" + req.params.id + "'");

            let video: YoutubeVideo | null;
            try {
                video = await this._cache.fetch(req.params.id);
            }
            // catch errors
            catch (err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    
                    // send fail api response
                    res.status(400).send({
                        "message": "Error getting video info: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(400).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            if (video == null) {
                // send fail api response
                res.status(404).send({
                   "message": "No such video found",
                   "success": false
               });
               return; // prevent other code from running
            }

            let result: SongServer.API.FetchedVideo = {
                // in typescript, '!' tells typescript to ignore the fact that the variable/field/whatever
                // you are accessing could be null or undefined.
                "title": video!.title,
                "id": video!.id
            };

            // success response
            let response: SongServer.API.Responses.FetchVideoAPIResponse = {
                "success": true,
                "data": result
            };

            res.send(response);
        })
    }
}
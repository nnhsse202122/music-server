import { Router } from "express";
import APIController from "../APIController";
import { APIModel } from "../APIModel"
import { youtube, youtube_v3 } from "@googleapis/youtube";
import { GaxiosResponse } from "gaxios";
import colors from "colors/safe";

// type containing the response data. A video response is given for
// when a video with a specific id is requested.
type VideoResponse = {
    /** The name of the video */
    name: string,
}

// type containing information of a fetched video using the search
// option for the youtube api.
type FetchedVideo = {
    /** The name of the video */
    name: string,
    /** The video id */
    id: string
}

export default class YoutubeModel extends APIModel<YoutubeModel> {

    public constructor(controller: APIController) {
        // version 1
        super(controller, "/yt", 1);
    }

    protected override initRoutes(router: Router): void {

        // will handle searching for a video using req.query.
        // returns the first 3 videos that match the specific query
        router.get("/videos", async (req, res) => {
            let keyword = req.query.keyword;
            if (keyword == null) {
                // send fail api response
                res.status(400).send({
                    "message": "A keyword query parameter is required!",
                    "success": false
                });

                return; // prevent other code from running
            }
            // make sure keyword is string
            if (typeof keyword !== "string") {
                // send fail api response
                res.status(400).send({
                    "message": "Keyword provided must not be an array. Only strings are accepted",
                    "success": false
                });

                return; // prevent other code from running
            }

            let videos: GaxiosResponse<youtube_v3.Schema$SearchListResponse>;
            try {
                // fetch video from google api
                videos = await youtube("v3").search.list({
                    "part": ["snippet"],
                    "type": ["video"],
                    "videoCategoryId": "10", // 10 is music category. 
                                             // Look at https://developers.google.com/youtube/v3/docs/videoCategories/list
                                             // for more info
                    "key": process.env.KEY,
                    "maxResults": 3,
                    "q": keyword
                });
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

            let foundVideos = videos.data.items!; // ignore that items could be null
            this.logger.debug(`Fetched ${foundVideos.length} videos. ${foundVideos.map((v) => 
                // map each video to a string representation, and join them
                `\n    [${colors.cyan(v.id!.videoId!)}] ${colors.yellow(v.snippet!.title!)}`).join("")}`);
            
            // convert the found video array to result array
            let result: FetchedVideo[] = foundVideos.map((v) => {
                // map each item in video array to a fetched video item
                return {
                    "id": v.id!.videoId!, // use ! to tell typescript nobody cares that x or y could be undefined/null
                    "name": v.snippet!.title!
                }
            });

            
            // send success api response
            res.status(400).send({
                "data": result,
                "success": true
            });
        });

        // wacky :id syntax allows for extracting the ID passed
        // using req.params.id
        router.get("/videos/:id", async (req, res) => {
            this.logger.debug("Searching for video with id '" + req.params.id + "'");

            // our list of videos
            let videos: GaxiosResponse<youtube_v3.Schema$VideoListResponse>;
            try {
                // fetch video from google api
                videos = await youtube("v3").videos.list({
                    "part": ["snippet", "contentDetails", "statistics"],
                    "id": [req.params.id],
                    "key": process.env.KEY
                });
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

            let videosItems = videos.data.items;
            if (videosItems == null) {
                 // send fail api response
                 res.status(404).send({
                    "message": "No such video found",
                    "success": false
                });
                return; // prevent other code from running
            }

            let firstVideo = videosItems[0];

            let result: VideoResponse = {
                // in typescript, '!' tells typescript to ignore the fact that the variable/field/whatever
                // you are accessing could be null or undefined.
                "name": firstVideo.snippet!.title!
            };

            // success response
            res.send({
                "data": result,
                "success": true
            });
        })
    }
}
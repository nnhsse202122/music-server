import { Request, Response, Router } from "express";
import APIController from "../APIController";
import { APIModel, APIResponseInfo } from "../APIModel";

function getIDFromSong(song: SongServer.Data.Song): string {
    if (song.source === "youtube") {
        return song.videoID;
    }
    throw new Error();
}

export default class PlaylistModel extends APIModel<PlaylistModel> {
    
    public constructor(controller: APIController) { 
        super(controller, "/playlists", 1);
    }

    protected override initRoutes(router: Router): void {
        
        router.post("/:playlistID/songs", async (req, res) => {
            let body: SongServer.API.Server.Requests.AddSongToPlaylistRequest = req.body;
            let playlistID = req.params.playlistID;

            await this.handleRes(res, this.postSong(body, playlistID));
        });
        router.delete("/:playlistID/songs/:songID", async (req, res) => {
            let playlistID = req.params.playlistID;
            let songID = req.params.songID;

            await this.handleRes(res, this.deleteSong(playlistID, songID));
        });
        router.get("/:playlistID", async (req, res) => {
            let playlistID = req.params.playlistID;

            await this.handleRes(res, this.getPlaylist(playlistID));
        });
        router.delete("/:playlistID", async (req, res) => {
            let playlistID = req.params.playlistID;

            await this.handleRes(res, this.deletePlaylist(playlistID));
        });
    }

    public async getPlaylist(playlistID: string): APIResponseInfo<SongServer.API.Responses.PlaylistInfoResponse> {
        try {
            let playlist = await this.playlistDatabase.get(playlistID);

            return {
                "success": true,
                "data": {
                    "id": playlistID,
                    "songs": playlist.songs.map((s) => {
                        return {
                            "id": getIDFromSong(s),
                            "requested_by": {
                                "email": s.requestedBy.email,
                                "name": s.requestedBy.name
                            },
                            "source": s.source
                        };
                    })
                }
            }
        }
        catch(err) {
            return {
                "success": false,
                "message": "No such playlist with id '" + playlistID + "' exists!",
                "status": 404
            };
        }
    }

    public async deletePlaylist(playlistID: string): APIResponseInfo<SongServer.API.Responses.DeletePlaylistResponse> {
        try {
            let existing = this.playlistDatabase.get(playlistID);

            this.logger.debug("Delete playlist: " + JSON.stringify(existing));
            
            return {
                "success": true,
                "data": await this.playlistDatabase.delete(playlistID)
            };
        }
        catch (err) {
            return {
                "success": false,
                "message": "No such playlist with id " + playlistID + " exists!",
                "status": 404
            };
        }
    }

    public async deleteSong(playlistID: string, songID: string): APIResponseInfo<SongServer.API.Responses.DeleteSongFromPlaylistResponse> {
        try {
            let playlist = await this.playlistDatabase.get(playlistID);

            let songIndex = playlist.songs.findIndex((s) => getIDFromSong(s) === songID);
            if (songIndex === -1) {
                return {
                    "success": false,
                    "status": 404,
                    "message": "No such song with id '" + songID + "' exists"
                };
            }

            playlist.songs.splice(songIndex, 1);

            return {
                "success": true,
                "data": await this.playlistDatabase.set(playlistID, playlist)
            };
        }
        catch(err) {
            let message: string;
            if (err instanceof Error) {
                message = err.message;
            }
            else {
                message = new String(err) as string;
            }
            this.logger.debug("Caught error: " + message);

            return {
                "success": false,
                "status": 404,
                "message": message
            };
        }
    }

    public async postSong(body: SongServer.API.Server.Requests.AddSongToPlaylistRequest, playlistID: string): APIResponseInfo<SongServer.API.Responses.AddSongToPlaylistResponse> {
        // validate request parameters
        let validSources: SongServer.API.SongSource[] = ["youtube"];
        if (!validSources.includes(body.source)) {
            return {
                "success": false,
                "message": "Invalid song source",
                "status": 400
            };
        }

        if (typeof body.id !== "string") {
            return {
                "success": false,
                "message": "id field must be a string",
                "status": 400
            };
        }
        
        if (typeof body.requestedBy !== "object") {
            return {
                "success": false,
                "message": "requestedBy field must be an object with the fields 'name', and 'email'",
                "status": 400
            };
        }

        if (typeof body.requestedBy.name !== "string") {
            return {
                "success": false,
                "message": "The name field of the requestedBy field must be a string",
                "status": 400
            };
        }

        if (typeof body.requestedBy.email !== "string") {
            return {
                "success": false,
                "message": "The email field of the requestedBy field must be a string",
                "status": 400
            };
        }

        let name = body.requestedBy.name as string;
        let email = body.requestedBy.email as string;
        let id = body.id;
        let source = body.source as SongServer.API.SongSource;

        // validate that the playlist with the given id exists
        try {
            let playlist = await this.playlistDatabase.get(playlistID);
            let song: SongServer.Data.Song;
            if (source === "youtube") {
                song = {
                    "requestedBy": {
                        "email": email,
                        "name": name
                    },
                    "source": "youtube",
                    "videoID": id
                };
            }
            else {
                return {
                    "success": false,
                    "message": "An error occurred internally",
                    "status": 500
                };
            }

            playlist.songs.push(song);

            return {
                "success": true,
                "data": await this.playlistDatabase.set(playlistID, playlist)
            };
        }
        catch(err) {
            let message: string;
            if (err instanceof Error) {
                message = err.message;
            }
            else {
                message = new String(err) as string;
            }
            this.logger.debug("Caught error: " + message);

            return {
                "success": false,
                "status": 404,
                "message": message
            };
        }
    }
}
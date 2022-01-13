import { Request, Router } from "express";
import APIController from "../APIController";
import { APIModel, APIResponseInfo } from "../APIModel";

export function getIDFromSong(song: SongServer.Data.SongBase): string {
    if (song.source === "youtube") {
        return song.videoID;
    }
    throw new Error();
}

export function getSongsFromMods(playlist: SongServer.Data.Playlist, mods: SongServer.Data.ClassroomPlaylistSongOverride[]): SongServer.Data.ClassroomPlaylistSong[] {
    let songs: SongServer.Data.ClassroomPlaylistSong[] = [...playlist.songs]
    for (let modIndex = 0; modIndex < mods.length; modIndex++) {
        let mod = mods[modIndex];

        if (mod.type === "add") {
            songs.splice(mod.index, 0, mod.song);
        }
        else if (mod.type === "move") {
            let s = songs.splice(mod.index, 1)[0];
            songs.splice(mod.newIndex, 0, s);
        }
        else if (mod.type === "remove") {
            songs.splice(mod.index, 1);
        }
    }

    return songs;
}

export default class PlaylistModel extends APIModel<PlaylistModel> {
    
    public constructor(controller: APIController) { 
        super(controller, "playlists", 1);
    }

    private generatePlaylistID(length: number = 15): string {
        let playlistID = "";
        const PLAYLIST_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let count = 0; count < length; count++) {
            playlistID += PLAYLIST_CHARS.charAt(Math.floor(Math.random() * PLAYLIST_CHARS.length));
        }
        return playlistID;
    }

    protected override initRoutes(router: Router): void {
        
        router.post("/:playlistOwner/:playlistID/songs", async (req, res) => {
            let body: SongServer.API.Server.Requests.AddSongToPlaylistRequest = req.body;
            let playlistID = req.params.playlistID;
            let playlistOwner = req.params.playlistOwner;

            await this.handleRes(res, this.postSong(req, body, playlistOwner, playlistID));
        });
        router.delete("/:playlistOwner/:playlistID/songs/:songID", async (req, res) => {
            let playlistID = req.params.playlistID;
            let playlistOwner = req.params.playlistOwner;
            let songID = req.params.songID;

            await this.handleRes(res, this.deleteSong(req, playlistOwner, playlistID, songID));
        });
        router.get("/:playlistOwner/:playlistID", async (req, res) => {
            let playlistID = req.params.playlistID;
            let playlistOwner = req.params.playlistOwner;

            await this.handleRes(res, this.getPlaylist(req, playlistOwner, playlistID));
        });
        router.delete("/:playlistOwner/:playlistID", async (req, res) => {
            let playlistID = req.params.playlistID;

            await this.handleRes(res, this.deletePlaylist(playlistID));
        });
        router.post("/:playlistOwner", async (req, res) => {
            let playlistOwner = req.params.playlistOwner;

            await this.handleRes(res, this.createPlaylist(req, playlistOwner));
        });
    }

    public async createPlaylist(req: Request, playlistOwner: string): APIResponseInfo<SongServer.API.Responses.CreatePlaylistResponse> {
        let body: SongServer.API.Server.Requests.CreatePlaylistRequest = req.body;
        if (body.name == null) {
            return this._bodyFieldRequired("name");
        }
        if (typeof body.name !== "string") {
            return this._invalidBodyFieldType("name", ["string"]);
        }

        let name = body.name.trim();
        name = name.substring(0, Math.min(name.length, 50));
        if (name.length === 0) {
            return {
                "success": false,
                "status": 400,
                "message": "The json field 'name' on the body must be a non-empty string"
            };
        }

        let visibility: SongServer.Data.PlaylistVisibility = "private";
        if (body.playlistVisibility != null) {
            if (typeof body.playlistVisibility !== "string") {
                return this._invalidBodyFieldType("playlistVisibility", ["string"]);
            }
            let vis = body.playlistVisibility.toLowerCase();
            if (vis === "public") {
                visibility = "public"
            }
            else if (vis === "private") {
                visibility = "private"
            }
            else if (vis === "unlisted") {
                visibility = "unlisted"
            }
            else {
                return {
                    "success": false,
                    "message": "Invalid visibility type. Valid visibilities are 'private', 'public', and 'unlisted'",
                    "status": 400
                };
            }
        }

        let info = await this._verifySession<SongServer.API.Responses.CreatePlaylistResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { user } = info;

        // only teachers may fetch a playlist
        if (user.type !== "teacher") {
            return {
                "status": 403,
                "message": "This endpoint is only available to teachers",
                "success": false
            };
        }

        if (user.email !== playlistOwner) {
            return {
                "status": 403,
                "message": "You don't have permission to add a playlist to this account",
                "success": false
            };
        }

        let userPlaylists: SongServer.Data.UserPlaylistsInfo;
        if (!await this.playlistDatabase.contains(user.email)) {
            userPlaylists = {
                "email": user.email,
                "playlists": {}
            };
            await this.playlistDatabase.add(user.email, userPlaylists);
        }
        else {
            userPlaylists = await this.playlistDatabase.get(user.email);
        }

        let newPlaylistID = this.generatePlaylistID();
        while (userPlaylists.playlists[newPlaylistID] != null) {
            newPlaylistID = this.generatePlaylistID();
        }

        let playlist: SongServer.Data.Playlist = {
            "name": name,
            "visibility": visibility,
            "songs": []
        };

        userPlaylists.playlists[newPlaylistID] = playlist;

        await this.playlistDatabase.set(user.email, userPlaylists);
        
        return {
            "data": {
                "owner": playlistOwner,
                "id": newPlaylistID
            },
            "success": true
        };
    }

    public async getPlaylist(req: Request, userEmail: string, playlistID: string): APIResponseInfo<SongServer.API.Responses.PlaylistInfoResponse> {
        
        let info = await this._verifySession<SongServer.API.Responses.PlaylistInfoResponse>(req);
        if (info.is_response) {
            return info.response;
        }
            
        let { user } = info;
        
        try {
            let playlist = await this.playlistDatabase.getPlaylist(userEmail, playlistID);

            if (playlist.visibility === "private") {
                if (user.email !== userEmail) {
                    return {
                        "success": false,
                        "status": 404,
                        "message": "No such playlist with id '" + playlistID + "' exists!",
                    };
                }
            }

            return {
                "success": true,
                "data": {
                    "id": playlistID,
                    "songs": playlist.songs.filter((s) => s.source != "unknown").map((s) => {
                        if (s.source === "youtube") {
                            return {
                                "id": s.videoID,
                                "source": "youtube",
                                "is_temp": false,
                            };
                        }
                        throw new Error("This shouldn't happen");
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

    public async deleteSong(req: Request, userEmail: string, playlistID: string, songID: string): APIResponseInfo<SongServer.API.Responses.DeleteSongFromPlaylistResponse> {
        let info = await this._verifySession<SongServer.API.Responses.DeleteSongFromPlaylistResponse>(req);
        if (info.is_response) {
            return info.response;
        }
            
        let { user } = info;

        if (user.email !== userEmail) {
            return {
                "success": false,
                "status": 403,
                "message": "You dont have permissions to delete a song from the playlist"
            };
        }

        try {
            let playlist = await this.playlistDatabase.getPlaylist(userEmail, playlistID);
            if (playlist.visibility === "private") {
                if (user.email !== userEmail) {
                    return {
                        "success": false,
                        "status": 404,
                        "message": "No such playlist with id '" + playlistID + "' exists!",
                    };
                }
            }

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
                "data": await this.playlistDatabase.setPlaylist(userEmail, playlistID, playlist)
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

    public async postSong(req: Request, body: SongServer.API.Server.Requests.AddSongToPlaylistRequest, userEmail: string, playlistID: string): APIResponseInfo<SongServer.API.Responses.AddSongToPlaylistResponse> {
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

        let id = body.id;
        let source = body.source as SongServer.API.SongSource;
        if (source !== "youtube") {
            return {
                "success": false,
                "message": "Invalid song source",
                "status": 400
            };
        }

        let info = await this._verifySession<SongServer.API.Responses.AddSongToPlaylistResponse>(req);
        if (info.is_response) {
            return info.response;
        }
            
        let { user } = info;
        if (user.email !== userEmail) {
            return {
                "success": false,
                "status": 403,
                "message": "You don't have permission to add a song to the playlist"
            }
        }

        // validate that the playlist with the given id exists
        try {
            let playlist = await this.playlistDatabase.getPlaylist(userEmail, playlistID);
            let song: SongServer.Data.PlaylistSong;
            if (source === "youtube") {
                song = {
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
                "data": await this.playlistDatabase.setPlaylist(userEmail, playlistID, playlist)
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
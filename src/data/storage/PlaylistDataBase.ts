import Playlist from "../playlists/Playlist";
import PlaylistVisibility from "../playlists/PlaylistVisibility";
import Song from "../playlists/Song";
import CollectionDataBase2D from "./CollectionDataBase2D";
import UserPlaylistsModel from "./models/UserPlaylistsModel";
import IUserPlaylists from "./interfaces/IUserPlaylists";


export default class PlaylistDataBase extends CollectionDataBase2D<string, string, Playlist> {

    private async _get(email: string): Promise<IUserPlaylists> {
        let fetchedUserPlaylists = await UserPlaylistsModel.findById(email).exec();
        if (fetchedUserPlaylists === null) {
            throw new Error(`User with email ${email} doesn't contain any playlists`);
        }

        return fetchedUserPlaylists;
    } 

    public async getPlaylists(email: string): Promise<Map<string, Playlist>> {
        let playlists = await UserPlaylistsModel.findById(email).exec();
        if (playlists === null) {
            return new Map<string, Playlist>();
        }

        let map = new Map<string, Playlist>();
        playlists.playlists.forEach((playlist) => {
            map.set(playlist.id, {
                "id": playlist.id,
                "playlistOwner": playlist.playlistOwner,
                "songs": playlist.songs.map((song) => {
                    return {
                        "id": song.id,
                        "position": song.position,
                        "requested_by": {
                            "email": song.requested_by.email,
                            "name": song.requested_by.name
                        },
                        "source": song.source,
                        "title": song.title
                    };
                }),
                "visibility": playlist.visibility
            });
        });
        return map;
    }
    public async get(email: string, playlistID: string): Promise<Playlist> {
        let playlists = await this.getPlaylists(email);
        if (!playlists.has(playlistID)) {
            throw new Error(`No playlist with id '${playlistID}' exists for user ${email}`);
        }
        return playlists.get(playlistID)!;
    }
    public async set(email: string, playlistID: string, playlist: Playlist): Promise<boolean> {
        let playlists = await this._get(email);
        for (let index = 0; index < playlists.playlists.length; index++) {
            let p = playlists.playlists[index];
            if (p.id === playlistID) {
                p.visibility = playlist.visibility,
                p.songs = playlist.songs.map((song) => {
                    return {
                        "id": song.id,
                        "position": song.position,
                        "requested_by": {
                            "email": song.requested_by.email,
                            "name": song.requested_by.name
                        },
                        "source": song.source,
                        "title": song.title
                    };
                });
                await playlists.save();
                return true;
            }
        }

        return false;
    }
    public async contains(email: string, playlistID: string): Promise<boolean> {
        return (await this.getPlaylists(email)).has(playlistID);
    }
    public async add(email: string, playlistID: string, playlist: Playlist): Promise<boolean> {
        let playlists = await UserPlaylistsModel.findById(email).exec();
        if (playlists === null) {
            playlists = new UserPlaylistsModel({
                "_id": email,
                "playlists": []
            });

            await playlists.save();
        }

        if (playlists.playlists.findIndex((p) => p.id === playlist.id) > -1) {
            return false;
        }

        playlists.playlists.push({
            "id": playlist.id,
            "playlistOwner": playlist.playlistOwner,
            "songs": playlist.songs.map((song) => {
                return {
                    "id": song.id,
                    "position": song.position,
                    "requested_by": {
                        "email": song.requested_by.email,
                        "name": song.requested_by.name
                    },
                    "source": song.source,
                    "title": song.title
                };
            }),
            "visibility": playlist.visibility
        });
        await playlists.save();
        return true;
    }

    public async delete(email: string, playlistID: string): Promise<boolean> {
        let playlists: IUserPlaylists;
        try {
            playlists  = await this._get(email);
        }
        catch {
            return false;
        }

        let index = playlists.playlists.findIndex((p) => p.id === playlistID);
        if (index === -1) {
            return false;
        }
        
        playlists.playlists.splice(index, 1);
        await playlists.save();
        return true;
    }
    public async put(email: string, playlistID: string, playlist: Playlist): Promise<boolean> {
        return super.put(email, playlistID, playlist);
    }

    public async canAccess(userEmail: string, email: string, id: string): Promise<boolean> {
        try {
            let userPlaylists = await this.getPlaylists(email);
            if (!userPlaylists.has(id) || (userPlaylists.get(email)!.visibility === PlaylistVisibility.PRIVATE && email !== userEmail)) {
                return false;
            }
            return true;
        }
        catch {
            return false;
        }
    }

    public async getSongsAsUser(userEmail: string, email: string, id: string): Promise<Song[]> {
        try {
            let userPlaylists = await this.getPlaylists(email);
            if (!userPlaylists.has(id) || (userPlaylists.get(email)!.visibility === PlaylistVisibility.PRIVATE && email !== userEmail)) {
                throw new Error("Failed to find playlist with id '" + id + "'");
            }
            return [...userPlaylists.get(email)!.songs];
        }
        catch {
            throw new Error("Failed to find playlist with id '" + id + "'");
        }
    }

}
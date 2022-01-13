import SimpleJSONDataBase from "../SimpleJSONDataBase";

export default class PlaylistDataBase extends SimpleJSONDataBase<string, SongServer.Data.UserPlaylistsInfo> {

    public async getPlaylist(user: string, playlistID: string): Promise<SongServer.Data.Playlist> {
        let userPlaylists = await this.get(user);
        let playlist = userPlaylists.playlists[playlistID];
        if (playlist == null) {
            throw new Error("No playlist with id '" + playlistID + "' exists");
        }

        return playlist;
    }

    public async setPlaylist(user: string, playlistID: string, playlist: SongServer.Data.Playlist) {
        let userPlaylists: SongServer.Data.UserPlaylistsInfo;
        try {
            userPlaylists = await this.get(user);
        }
        catch {
            return false;
        }
        
        userPlaylists.playlists[playlistID] = playlist;
        return await this.set(user, userPlaylists);
    }
}
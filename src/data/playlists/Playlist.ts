import PlaylistVisibility from "./PlaylistVisibility";
import Song from "./Song";

type Playlist = {
    id: string,
    playlistOwner: string,
    visibility: PlaylistVisibility,
    songs: Song[]
};

export default Playlist;
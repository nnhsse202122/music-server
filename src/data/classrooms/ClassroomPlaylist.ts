import { i32 as int } from "typed-numbers";
import SongModification from "./SongModification";
import PlaylistReference from "../playlists/PlaylistReference";

type ClassroomPlaylist = {
    playlist: PlaylistReference | null,
    currentSongPosition: int,
    modifications: SongModification[]
};

export default ClassroomPlaylist;
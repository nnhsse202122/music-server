import ClassroomPlaylistSongReference from "./ClassroomPlaylistSongReference";
import ClassroomPlaylistSongV2 from "./ClassroomPlaylistV2Song";

type ClassroomPlaylistV2 = {
    songs: ClassroomPlaylistSongV2[],
    priority: ClassroomPlaylistSongV2[],
    currentSong: ClassroomPlaylistSongReference
}

export default ClassroomPlaylistV2;
import ClassroomSongV2 from "../../data/classrooms/ClassroomSongV2";
import ClassroomPlaylistSongReference from "../../data/classrooms/ClassroomPlaylistSongReference";

type RemoveClassroomSongResponseV2 = {
    songs: ClassroomSongV2[],
    currentSong: ClassroomPlaylistSongReference
}

export default RemoveClassroomSongResponseV2;
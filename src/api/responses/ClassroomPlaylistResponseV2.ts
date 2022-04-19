import SongTeacherViewV2 from "../../data/classrooms/SongTeacherViewV2";

type ClassroomPlaylistResponseV2 = {
    songs: SongTeacherViewV2[],
    currentSong: SongTeacherViewV2 | null,
}
export default ClassroomPlaylistResponseV2;


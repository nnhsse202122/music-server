import ClassroomSong from "../../data/classrooms/ClassroomSong";
import { i32 as int } from "typed-numbers";

type RemoveClassroomSongResponse = {
    songs: ClassroomSong[],
    songPosition: int
}

export default RemoveClassroomSongResponse;
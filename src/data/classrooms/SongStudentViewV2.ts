import ClassroomSongV2 from "./ClassroomSongV2";

type SongStudentViewV2 = ClassroomSongV2 & {
    requested_by: undefined,
    from_priority: undefined,
    likes: undefined,
    is_liked: boolean
};
export default SongStudentViewV2;
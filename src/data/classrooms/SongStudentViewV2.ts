import ClassroomSongV2 from "./ClassroomSongV2";

type SongStudentView = ClassroomSongV2 & {
    requested_by: undefined,
    from_priority: undefined
};
export default SongStudentView;
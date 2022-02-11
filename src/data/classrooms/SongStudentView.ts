import ClassroomSong from "./ClassroomSong";

type SongStudentView = ClassroomSong & {
    requested_by: undefined,
    modification: undefined
};

export default SongStudentView;
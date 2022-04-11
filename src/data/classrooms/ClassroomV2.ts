import ClassroomSettings from "./ClassroomSettings";
import StudentInClass from "./StudentInClass";
import ClassroomPlaylistV2 from "./ClassroomPlaylistV2";

type ClassroomV2 = {
    name: string,
    code: string,
    owner: string,
    settings: ClassroomSettings,
    playlist: ClassroomPlaylistV2,
    students: StudentInClass[]
}

export default ClassroomV2;
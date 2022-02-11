import ClassroomSettings from "./ClassroomSettings";
import ClassroomPlaylist from "./ClassroomPlaylist";
import StudentInClass from "./StudentInClass";

type Classroom = {
    name: string,
    code: string,
    owner: string,
    settings: ClassroomSettings,
    playlist: ClassroomPlaylist,
    students: StudentInClass[]
}

export default Classroom;
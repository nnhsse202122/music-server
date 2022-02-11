import BasicClassroomSettings from "../../data/classrooms/BasicClassroomSettings";
import StudentInClass from "../../data/classrooms/StudentInClass";

type GottenClassroomAsTeacher = {
    name: string,
    code: string,
    settings: BasicClassroomSettings,
    students: StudentInClass[]
}
export default GottenClassroomAsTeacher;
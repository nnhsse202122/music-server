import { i32 as int } from "typed-numbers";
import BasicClassroomSettings from "../../data/classrooms/BasicClassroomSettings";

type GottenClassroomAsStudent = {
    name: string,
    code: string,
    settings: BasicClassroomSettings,
    tokens: int
}
export default GottenClassroomAsStudent;
import GottenClassroomAsOutsider from "./GottenClassroomAsOutsider";
import GottenClassroomAsStudent from "./GottenClassroomAsStudent";
import GottenClassroomAsTeacher from "./GottenClassroomAsTeacher";

type GottenClassroom = GottenClassroomAsOutsider | GottenClassroomAsStudent | GottenClassroomAsTeacher;

export default GottenClassroom;
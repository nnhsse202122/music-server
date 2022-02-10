import { Document } from "mongoose";
import ClassroomPlaylist from "../../classrooms/ClassroomPlaylist";
import ClassroomSettings from "../../classrooms/ClassroomSettings";
import StudentInClass from "../../classrooms/StudentInClass";


export default interface IClassroom extends Document {
    name: string,
    code: string,
    owner: string,
    settings: ClassroomSettings,
    playlist: ClassroomPlaylist,
    students: StudentInClass[]
};
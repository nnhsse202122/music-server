import { Document } from "mongoose";
import ClassroomPlaylistV2 from "../../classrooms/ClassroomPlaylistV2";
import ClassroomSettings from "../../classrooms/ClassroomSettings";
import StudentInClass from "../../classrooms/StudentInClass";


export default interface IClassroomV2 extends Document {
    name: string,
    code: string,
    owner: string,
    settings: ClassroomSettings,
    playlist: ClassroomPlaylistV2,
    students: StudentInClass[]
};
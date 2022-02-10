import BasicUser from "../users/BasicUser";
import ClassroomSong from "./ClassroomSong";

type GenericClassroomSong = ClassroomSong & {
    requested_by: BasicUser,
    modification: undefined
};

export default GenericClassroomSong;
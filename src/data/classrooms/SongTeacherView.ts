import BasicUser from "../users/BasicUser";
import ClassroomSong from "./ClassroomSong";
import SongModificationInfo from "./SongModificationInfo";

type SongTeacherView = ClassroomSong & {
    requested_by: BasicUser,
    modification: SongModificationInfo
};

export default SongTeacherView;
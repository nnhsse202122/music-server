import BasicUser from "../users/BasicUser";
import ClassroomSongV2 from "./ClassroomSongV2";

type SongTeacherViewV2 = ClassroomSongV2 & {
    requested_by: BasicUser,
    from_priority: boolean
};
export default SongTeacherViewV2;
import BasicUser from "../users/BasicUser";
import ClassroomSongV2 from "./ClassroomSongV2";
import { i32 as int } from "typed-numbers";

type SongTeacherViewV2 = ClassroomSongV2 & {
    requested_by: BasicUser,
    from_priority: boolean,
    is_liked: undefined,
    likes: int
};
export default SongTeacherViewV2;
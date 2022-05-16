import BasicSong from "../playlists/BasicSong";
import BasicUser from "../users/BasicUser";
import { i32 as int } from "typed-numbers";

type ClassroomSongV2 = BasicSong & {
    requested_by: BasicUser | undefined,
    from_priority: boolean | undefined,
    position: int,
    likes: int | undefined,
    is_liked: boolean | undefined
}

export default ClassroomSongV2;
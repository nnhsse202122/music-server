import BasicSong from "../playlists/BasicSong";
import BasicUser from "../users/BasicUser";
import SongModificationInfo from "./SongModificationInfo";

type FullClassroomSongInfo = BasicSong & {
    requested_by: BasicUser,
    modification: SongModificationInfo
}

export default FullClassroomSongInfo;
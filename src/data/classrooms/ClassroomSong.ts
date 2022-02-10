import BasicSong from "../playlists/BasicSong";
import BasicUser from "../users/BasicUser";
import SongModificationInfo from "./SongModificationInfo";

type ClassroomSong = BasicSong & {
    requested_by: BasicUser | undefined,
    modification: SongModificationInfo | undefined;
}

export default ClassroomSong;
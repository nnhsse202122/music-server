import SongSource from "../playlists/SongSource";
import BasicUser from "../users/BasicUser";

type ClassroomPlaylistSongV2 = {
    id: string,
    title: string,
    source: SongSource,
    requested_by: BasicUser
}

export default ClassroomPlaylistSongV2;
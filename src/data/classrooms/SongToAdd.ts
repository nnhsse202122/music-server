import SongSource from "../playlists/SongSource";
import BasicUser from "../users/BasicUser";

type SongToAdd = {
    id: string,
    title: string,
    source: SongSource,
    requested_by: BasicUser
};

export default SongToAdd;
import SongModificationType from "./SongModificationType";
import { i32 as int } from "typed-numbers";

type SongModificationInfo = {
    type: SongModificationType,
    song_position: int,
    playlist_position: int
}

export default SongModificationInfo;
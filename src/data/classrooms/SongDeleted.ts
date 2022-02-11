import SongModificationType from "./SongModificationType";
import { i32 as int } from "typed-numbers";

type SongDeleted = {
    type: SongModificationType.DELETED,
    index: int
}

export default SongDeleted;
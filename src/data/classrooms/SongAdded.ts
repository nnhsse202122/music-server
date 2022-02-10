import SongModificationType from "./SongModificationType";
import { i32 as int } from "typed-numbers";
import SongToAdd from "./SongToAdd";

type SongAdded = {
    type: SongModificationType.ADDED,
    index: int,
    song: SongToAdd;
}

export default SongAdded;
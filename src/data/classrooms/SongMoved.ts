import SongModificationType from "./SongModificationType";
import { i32 as int } from "typed-numbers";

type SongMoved = {
    type: SongModificationType.MOVED,
    old_index: int,
    new_index: int
};

export default SongMoved;
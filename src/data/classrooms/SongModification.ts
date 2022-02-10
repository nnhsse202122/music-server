import SongAdded from "./SongAdded";
import SongDeleted from "./SongDeleted";
import SongModificationType from "./SongModificationType";
import SongMoved from "./SongMoved";

type SongModification = SongAdded | SongDeleted | SongMoved | {
    type: SongModificationType.NONE
};

export default SongModification; 
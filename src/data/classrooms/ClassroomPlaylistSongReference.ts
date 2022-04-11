import { i32 as int } from "typed-numbers";

type ClassroomPlaylistSongReference = {
    /** The index of the song */
    index: int,
    /** Whether or not it's from the priority queue */
    fromPriority: boolean
}

export default ClassroomPlaylistSongReference;
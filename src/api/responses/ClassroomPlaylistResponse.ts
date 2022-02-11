import SongModification from "../../data/classrooms/SongModification";
import PlaylistReference from "../../data/playlists/PlaylistReference";

type ClassroomPlaylistResponse = {
    playlist: PlaylistReference | null,
    modifications: SongModification[]
};

export default ClassroomPlaylistResponse;
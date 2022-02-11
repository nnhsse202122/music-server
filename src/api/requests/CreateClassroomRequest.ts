import PlaylistReference from "../../data/playlists/PlaylistReference";

type CreateClassroomRequest = {
    name: string,
    joinable?: boolean,
    allowSongSubmissions?: boolean,
    submissionsRequireTokens?: boolean,
    playlistVisible?: boolean,
    playlist?: PlaylistReference
};

export default CreateClassroomRequest;
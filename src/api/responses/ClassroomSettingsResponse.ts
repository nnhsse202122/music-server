import { i32 as int } from "typed-numbers";

type ClassroomSettingsResponse = {
    name: string,
    allowSongSubmissions: boolean,
    submissionsRequireTokens: boolean,
    joinable: boolean,
    playlistVisible: boolean,
    likesEnabled: boolean,
    priorityEnabled: boolean,
    priorityCost: int
};

export default ClassroomSettingsResponse;
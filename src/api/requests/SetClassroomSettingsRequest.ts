import { i32 as int } from "typed-numbers";

type SetClassroomSettingsRequest = {
    name: string,
    allowSongSubmissions: boolean,
    submissionsRequireTokens: boolean,
    joinable: boolean,
    playlistVisible: boolean,
    likesEnabled: boolean,
    priorityEnabled: boolean,
    priorityCost: int,
    likesVisible: boolean
};

export default SetClassroomSettingsRequest;
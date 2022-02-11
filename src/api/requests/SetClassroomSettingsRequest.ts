type SetClassroomSettingsRequest = {
    name: string,
    allowSongSubmissions: boolean,
    submissionsRequireTokens: boolean,
    joinable: boolean,
    playlistVisible: boolean
};

export default SetClassroomSettingsRequest;
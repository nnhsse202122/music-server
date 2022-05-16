type CreateClassroomV2Request = {
    name: string,
    joinable?: boolean,
    allowSongSubmissions?: boolean,
    submissionsRequireTokens?: boolean,
    playlistVisible?: boolean
};

export default CreateClassroomV2Request;
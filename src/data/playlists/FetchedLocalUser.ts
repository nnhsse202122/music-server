import Role from "../users/Role";

type FetchedLocalUser = {
    name: string,
    email: string,
    profile_url: string,
    role: Role,
    classrooms: string[],
    playlists: string[]
};

export default FetchedLocalUser;
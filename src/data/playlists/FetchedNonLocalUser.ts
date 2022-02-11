import Role from "../users/Role";

type FetchedNonLocalUser = {
    email: string,
    name: string,
    profile_url: string,
    role: Role
};

export default FetchedNonLocalUser;
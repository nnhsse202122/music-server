import Role from "./Role";
import UserClass from "./UserClass";
import UserPlaylist from "./UserPlaylist";

type User = {
    type: Role,
    classes: UserClass[],
    playlists: UserPlaylist[],
    email: string,
    profile_url: string,
    name: string
};

export default User;
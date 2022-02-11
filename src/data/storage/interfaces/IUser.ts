import { Document } from "mongoose";
import Role from "../../users/Role";
import UserClass from "../../users/UserClass";
import UserPlaylist from "../../users/UserPlaylist";


export default interface IUser extends Document {
    type: Role;
    classes: UserClass[];
    playlists: UserPlaylist[];
    email: string;
    profile_url: string;
    name: string;
}
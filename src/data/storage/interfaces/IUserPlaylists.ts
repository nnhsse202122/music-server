import { Document } from "mongoose";
import Playlist from "../../playlists/Playlist";


export default interface IUserPlaylists extends Document {
    email: string,
    playlists: Playlist[]
};
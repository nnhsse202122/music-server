import BasicUser from "../users/BasicUser";
import BasicSong from "./BasicSong";
import { i32 as int } from "typed-numbers";

type Song = BasicSong & {
    requested_by: BasicUser,
    position: int
};

export default Song;
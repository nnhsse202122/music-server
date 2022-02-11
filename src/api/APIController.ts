import { Controller } from "../mvc/Controller";
import ServerInstance from "../ServerInstance";
import AuthEndpoint from "./endpoints/auth/AuthEndpoint";
import ClassroomEndpoint from "./endpoints/classroom/ClassroomEndpoint";
import ClassroomPlaylistEndpoint from "./endpoints/classroom/ClassroomPlaylistEndpoint";
import ClassroomPlaylistPositionEndpoint from "./endpoints/classroom/ClassroomPlaylistPositionEndpoint";
import ClassroomPlaylistShuffleEndpoint from "./endpoints/classroom/ClassroomPlaylistShuffle";
import ClassroomPlaylistSongsEndpoint from "./endpoints/classroom/ClassroomPlaylistSongsEndpoint";
import ClassroomsEndpoint from "./endpoints/classroom/ClassroomsEndpoint";
import ClassroomSettingsEndpoint from "./endpoints/classroom/ClassroomSettingsEndpoint";
import ClassroomStudentEndpoint from "./endpoints/classroom/ClassroomStudentEndpoint";
import ClassroomStudentsEndpoint from "./endpoints/classroom/ClassroomStudentsEndpoint";
import ClassroomStudentTokenEndpoint from "./endpoints/classroom/ClassroomStudentTokenEndpoint";
import UserEndpoint from "./endpoints/users/UserEndpoint";
import YoutubeFetchEndpoint from "./endpoints/youtube/YoutubeFetchEndpoint";
import YoutubeSearchEndpoint from "./endpoints/youtube/YoutubeSearchEndpoint";

export default class APIController extends Controller {

    public constructor(server: ServerInstance) {
        super(server);
    }

    public createModels(): void {
        this.addModel(AuthEndpoint);
        this.addModel(ClassroomEndpoint);
        this.addModel(ClassroomPlaylistEndpoint);
        this.addModel(ClassroomPlaylistPositionEndpoint);
        this.addModel(ClassroomPlaylistShuffleEndpoint);
        this.addModel(ClassroomPlaylistSongsEndpoint);
        this.addModel(ClassroomsEndpoint);
        this.addModel(ClassroomSettingsEndpoint);
        this.addModel(ClassroomStudentEndpoint);
        this.addModel(ClassroomStudentsEndpoint);
        this.addModel(ClassroomStudentTokenEndpoint);
        this.addModel(UserEndpoint);
        this.addModel(YoutubeFetchEndpoint);
        this.addModel(YoutubeSearchEndpoint);
    }
}
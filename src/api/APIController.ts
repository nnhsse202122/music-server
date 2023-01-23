import { Controller } from "../mvc/Controller";
import ServerInstance from "../ServerInstance";
import AuthEndpoint from "./endpoints/v2/auth/AuthEndpoint";
import ClassroomEndpointV2 from "./endpoints/v2/classrooms/ClassroomEndpointV2";
import ClassroomPlaylistCurrentSongEndpoint from "./endpoints/v2/classrooms/ClassroomPlaylistCurrentSongEndpoint";
import ClassroomPlaylistEndpointV2 from "./endpoints/v2/classrooms/ClassroomPlaylistEndpointV2";
import ClassroomPlaylistNextSongEndpoint from "./endpoints/v2/classrooms/ClassroomPlaylistNextSongEndpoint";
import ClassroomPlaylistPreviousSongEndpoint from "./endpoints/v2/classrooms/ClassroomPlaylistPreviousSongEndpoint";
import ClassroomPlaylistShuffleEndpointV2 from "./endpoints/v2/classrooms/ClassroomPlaylistShuffleV2";
import ClassroomPlaylistSongLikesEndpoint from "./endpoints/v2/classrooms/ClassroomPlaylistSongLikesEndpoint";
import ClassroomPlaylistSongsEndpointV2 from "./endpoints/v2/classrooms/ClassroomPlaylistSongsEndpointV2";
import ClassroomsEndpointV2 from "./endpoints/v2/classrooms/ClassroomsEndpointV2";
import ClassroomSettingsEndpointV2 from "./endpoints/v2/classrooms/ClassroomSettingsEndpointV2";
import ClassroomStudentEndpointV2 from "./endpoints/v2/classrooms/ClassroomStudentEndpointV2";
import ClassroomStudentLikesEndpoint from "./endpoints/v2/classrooms/ClassroomStudentLikesEndpoint";
import ClassroomStudentsEndpointV2 from "./endpoints/v2/classrooms/ClassroomStudentsEndpointV2";
import ClassroomStudentTokenEndpointV2 from "./endpoints/v2/classrooms/ClassroomStudentTokenEndpointV2";
import BeansEndpoint from "./endpoints/v2/nice/BeansEndpoint";
import UserEndpoint from "./endpoints/v2/users/UserEndpoint";
import YoutubeFetchEndpoint from "./endpoints/v2/youtube/YoutubeFetchEndpoint";
import YoutubeSearchEndpoint from "./endpoints/v2/youtube/YoutubeSearchEndpoint";

export default class APIController extends Controller {

    public constructor(server: ServerInstance) {
        super(server);
    }

    public createModels(): void {
        this.addModel(AuthEndpoint);
        //this.addModel(ClassroomEndpoint);
        //this.addModel(ClassroomPlaylistEndpoint);
        //this.addModel(ClassroomPlaylistPositionEndpoint);
        //this.addModel(ClassroomPlaylistShuffleEndpoint);
        //this.addModel(ClassroomPlaylistSongsEndpoint);
        //this.addModel(ClassroomsEndpoint);
        //this.addModel(ClassroomSettingsEndpoint);
        //this.addModel(ClassroomStudentEndpoint);
        //this.addModel(ClassroomStudentsEndpoint);
        //this.addModel(ClassroomStudentTokenEndpoint);
        this.addModel(UserEndpoint);
        this.addModel(YoutubeFetchEndpoint);
        this.addModel(YoutubeSearchEndpoint);

        this.addModel(ClassroomEndpointV2);
        this.addModel(ClassroomPlaylistCurrentSongEndpoint);
        this.addModel(ClassroomPlaylistEndpointV2);
        this.addModel(ClassroomPlaylistNextSongEndpoint);
        this.addModel(ClassroomPlaylistShuffleEndpointV2);
        this.addModel(ClassroomPlaylistSongsEndpointV2);
        this.addModel(ClassroomsEndpointV2);
        this.addModel(ClassroomSettingsEndpointV2);
        this.addModel(ClassroomStudentEndpointV2);
        this.addModel(ClassroomStudentsEndpointV2);
        this.addModel(ClassroomStudentTokenEndpointV2);
        this.addModel(ClassroomPlaylistPreviousSongEndpoint);
        this.addModel(ClassroomPlaylistSongLikesEndpoint);
        this.addModel(ClassroomStudentLikesEndpoint);

        // easter egg
        this.addModel(BeansEndpoint);
    }
}
import { Controller } from "../mvc/Controller";
import ServerInstance from "../ServerInstance";
import AuthEndpoint from "./endpoints/auth/AuthEndpoint";
import ClassroomEndpoint from "./endpoints/classroom/ClassroomEndpoint";
import ClassroomEndpointV2 from "./endpoints/classroom/ClassroomEndpointV2";
import ClassroomPlaylistCurrentSongEndpoint from "./endpoints/classroom/ClassroomPlaylistCurrentSongEndpoint";
import ClassroomPlaylistEndpoint from "./endpoints/classroom/ClassroomPlaylistEndpoint";
import ClassroomPlaylistEndpointV2 from "./endpoints/classroom/ClassroomPlaylistEndpointV2";
import ClassroomPlaylistNextSongEndpoint from "./endpoints/classroom/ClassroomPlaylistNextSongEndpoint";
import ClassroomPlaylistPositionEndpoint from "./endpoints/classroom/ClassroomPlaylistPositionEndpoint";
import ClassroomPlaylistPreviousSongEndpoint from "./endpoints/classroom/ClassroomPlaylistPreviousSongEndpoint";
import ClassroomPlaylistShuffleEndpoint from "./endpoints/classroom/ClassroomPlaylistShuffle";
import ClassroomPlaylistShuffleEndpointV2 from "./endpoints/classroom/ClassroomPlaylistShuffleV2";
import ClassroomPlaylistSongLikesEndpoint from "./endpoints/classroom/ClassroomPlaylistSongLikesEndpoint";
import ClassroomPlaylistSongsEndpoint from "./endpoints/classroom/ClassroomPlaylistSongsEndpoint";
import ClassroomPlaylistSongsEndpointV2 from "./endpoints/classroom/ClassroomPlaylistSongsEndpointV2";
import ClassroomsEndpoint from "./endpoints/classroom/ClassroomsEndpoint";
import ClassroomsEndpointV2 from "./endpoints/classroom/ClassroomsEndpointV2";
import ClassroomSettingsEndpoint from "./endpoints/classroom/ClassroomSettingsEndpoint";
import ClassroomSettingsEndpointV2 from "./endpoints/classroom/ClassroomSettingsEndpointV2";
import ClassroomStudentEndpoint from "./endpoints/classroom/ClassroomStudentEndpoint";
import ClassroomStudentEndpointV2 from "./endpoints/classroom/ClassroomStudentEndpointV2";
import ClassroomStudentLikesEndpoint from "./endpoints/classroom/ClassroomStudentLikesEndpoint";
import ClassroomStudentsEndpoint from "./endpoints/classroom/ClassroomStudentsEndpoint";
import ClassroomStudentsEndpointV2 from "./endpoints/classroom/ClassroomStudentsEndpointV2";
import ClassroomStudentTokenEndpoint from "./endpoints/classroom/ClassroomStudentTokenEndpoint";
import ClassroomStudentTokenEndpointV2 from "./endpoints/classroom/ClassroomStudentTokenEndpointV2";
import UserEndpoint from "./endpoints/users/UserEndpoint";
import YoutubeFetchEndpoint from "./endpoints/youtube/YoutubeFetchEndpoint";
import YoutubeSearchEndpoint from "./endpoints/youtube/YoutubeSearchEndpoint";

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
    }
}
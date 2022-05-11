import { Request } from "express";
import ClassroomSongV2 from "../../../data/classrooms/ClassroomSongV2";
import ClassroomV2 from "../../../data/classrooms/ClassroomV2";
import { isInClassCode } from "../../../data/extensions/UserExtensions";
import APIEndpoint from "../../../mvc/api/APIEndpoint";
import APIRoute from "../../../mvc/api/APIRoute";
import RequestMethod from "../../../mvc/requests/RequestMethod";
import APIController from "../../APIController";
import APIResponse from "../../responses/APIResponse";
import { i32 as int } from "typed-numbers";
import Role from "../../../data/users/Role";
import SongTeacherViewV2 from "../../../data/classrooms/SongTeacherViewV2";
import { assertContentIsJSON, assertJSONBodyFieldIsNumber, assertJSONBodyIsntNull } from "../EndpointAssert";
import LikeSongRequest from "../../requests/LikeSongRequest";

class PostRoute extends APIRoute<boolean, ClassroomPlaylistSongLikesEndpoint> {

    public constructor(endpoint: ClassroomPlaylistSongLikesEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<boolean>> {
        let failResponse = assertContentIsJSON(this, req) ??
            assertJSONBodyIsntNull(this, req) ??
            assertJSONBodyFieldIsNumber(this, req, "/index");

        if (failResponse) {
            return failResponse;
        }

        let body = req.body as LikeSongRequest;

        let sessionInfo = await this.verifySession(req);
        if (!sessionInfo.verified) {
            return sessionInfo.response;
        }

        let session = sessionInfo.session;
        let code = req.params.code;

        let userInfo = await this.getUserFromSession(session);
        if (!userInfo.verified) {
            return userInfo.response;
        }

        let user = userInfo.user;
        if (user.type !== Role.Student) {
            return this.fail("api.restrictions.students", {});
        }

        if (!isInClassCode(user, code)) {
            return this.fail("api.classroom.not_found", {});
        }

        let classroom: ClassroomV2;
        try {
            classroom = await this.server.db.classroomsV2.get(code);
        }
        catch {
            return this.fail("api.classroom.not_found", {});
        }

        if (!classroom.settings.playlistVisible) {
            return this.fail("api.classroom.playlist.hidden", {});
        }

        if (body.index < 0 || body.index >= classroom.playlist.songs.length) {
            return this.fail("api.body.field.number", {});
        }

        let song = classroom.playlist.songs[body.index];
        if (song.likes.includes(user.email)) {
            return this.fail("api.playlist.song.liked", {});
        }

        song.likes.push(user.email);
        classroom.playlist.songs.splice(body.index, 1);
        let replaceIndex;
        if (body.index - 1 < 0) {
            replaceIndex = classroom.playlist.songs.length;
        }
        else {
            replaceIndex = body.index - 1;
        }
        if (!classroom.playlist.currentSong.fromPriority && classroom.playlist.currentSong.index === body.index) {
            classroom.playlist.currentSong.index = int(replaceIndex);
        }
        classroom.playlist.songs.splice(replaceIndex, 0, song);


        await this.server.db.classroomsV2.set(code, classroom);
        return this.success(true);
    }
}

export default class ClassroomPlaylistSongLikesEndpoint extends APIEndpoint {

    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/songs/likes", "class-playlist-song-like", 2);

        this._post = new PostRoute(this);
    }

    protected override setup(): void {
        this.addRoute(this._post);
    }
}
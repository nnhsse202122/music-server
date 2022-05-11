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

class PostRoute extends APIRoute<ClassroomSongV2, ClassroomPlaylistPreviousSongEndpoint> {

    public constructor(endpoint: ClassroomPlaylistPreviousSongEndpoint) {
        super(endpoint, RequestMethod.POST);
    }

    protected async doHandle(req: Request): Promise<APIResponse<ClassroomSongV2>> {
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
        if (user.type !== Role.Teacher) {
            return this.fail("api.restrictions.teachers", {});
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

        if (classroom.playlist.currentSong.fromPriority) {
            classroom.playlist.priority.splice(0, 1);

            if (classroom.playlist.priority.length > 0) {
                let prioritySong = classroom.playlist.priority[0];
                classroom.playlist.currentSong = {
                    "fromPriority": true,
                    "index": int(classroom.playlist.songs.findIndex((song) => {
                        return song.id == prioritySong.id && song.source == prioritySong.source;
                    }))
                };
            }
            else if (classroom.playlist.currentSong.index > -1) {
                classroom.playlist.currentSong = {
                    "fromPriority": false,
                    "index": int((classroom.playlist.currentSong.index - 1) % classroom.playlist.songs.length)
                };
            }
        }
        else {
            classroom.playlist.currentSong = {
                "fromPriority": false,
                "index": int((classroom.playlist.currentSong.index - 1) % classroom.playlist.songs.length)
            };
        }

        await this.server.db.classroomsV2.set(code, classroom);
        let currentSong: SongTeacherViewV2;
        if (classroom.playlist.currentSong.fromPriority) {
            let s = classroom.playlist.priority[0];
            currentSong = {
                "from_priority": true,
                "id": s.id,
                "position": int(classroom.playlist.currentSong.index + 1),
                "title": s.title,
                "source": s.source,
                "is_liked": undefined,
                "likes": int(s.likes.length),
                "requested_by": {
                    "email": s.requested_by.email,
                    "name": s.requested_by.name
                }
            };
        }
        else {
            let s = classroom.playlist.songs[classroom.playlist.currentSong.index];
            currentSong = {
                "from_priority": false,
                "id": s.id,
                "position": int(classroom.playlist.currentSong.index + 1),
                "title": s.title,
                "source": s.source,
                "is_liked": undefined,
                "likes": int(s.likes.length),
                "requested_by": {
                    "email": s.requested_by.email,
                    "name": s.requested_by.name
                }
            };
        }
        return this.success(currentSong);
    }
}

export default class ClassroomPlaylistPreviousSongEndpoint extends APIEndpoint {

    private readonly _post: PostRoute;

    public constructor(controller: APIController) {
        super(controller, "/classrooms/:code/playlist/previous-song", "previous-class-playlist-song", 2);

        this._post = new PostRoute(this);
    }

    protected override setup(): void {
        this.addRoute(this._post);
    }
}
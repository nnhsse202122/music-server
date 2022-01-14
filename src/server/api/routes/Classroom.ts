import { Request, Router } from "express";
import DataBase from "../../../database/DataBase";
import SimpleJSONDataBase from "../../../database/SimpleJSONDataBase";
import { getRoleFromEmail } from "../../Server";
import APIController from "../APIController";
import { APIModel, APIResponseInfo, GottenSessionInfo } from "../APIModel";
import { getIDFromSong, getSongsFromMods } from "./Playlist";

// to be honest, this will be the type that will need to be refactored the most.
type GottenPlaylistInfo<T> = GottenSessionInfo<T> & ({
    is_response: true
} | {
    is_response: false,
    playlist: SongServer.Data.Playlist | null,
    classroom: SongServer.Data.Classroom
});
export default class ClassroomModel extends APIModel<ClassroomModel> {

    public constructor(controller: APIController) {
        // api version 1
        super(controller, "classrooms", 1);
    }

    protected override initRoutes(router: Router): void {
        // get classroom list from teacher email
        router.get("/", async (req, res) => {
            let session: SongServer.Data.Session;
            try {
                session = await this.authorizeFromRequest(req);
            }
            catch (err) {
                let message: string;
                if (err instanceof Error) {
                    message = err.message;
                }
                else {
                    message = new String(err) as string;
                }

                res.status(403).send({
                    "message": "Error whilst authorizing: " + message,
                    "success": false
                });
                return;
            }

            let email = session.email;
            this.logger.debug("Received request for all classrooms from email " + email);

            let role = getRoleFromEmail(email);
            if (role === "invalid") {
                res.status(500).send({
                    "message": "Failed fetching role",
                    "success": false
                });
                return;
            }

            let user: SongServer.Data.User;
            try {
                user = await this.userDatabase.get(email);
            }
            catch(err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error fetching classrooms from teacher: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            // we need to add support for getting students/teacher stuffies
            let result: SongServer.API.ClassroomInfo[] = [];
            for (let index = 0; index < user.classrooms.length; index++) {
                let classroom = user.classrooms[index];
                
                try {
                    let info = await this.classroomDatabase.get(classroom.code);
                    let playlist: SongServer.Data.Playlist | null = null;
                    if (info.playlist != null) {
                        playlist = await this.playlistDatabase.getPlaylist(info.playlist.playlistOwner, info.playlist.playlistID);
                    }

                    let songs = playlist == null ? null : getSongsFromMods(playlist, info.playlist!.overrides);

                    let students: SongServer.API.StudentInClassroom[] = [];
                    if (role === "teacher") {
                        for (let studentIndex = 0; studentIndex < info.students.length; studentIndex++) {
                            let foundUser = await this.userDatabase.get(info.students[studentIndex]);
                            if (foundUser.type === "student") {
                                students.push({
                                    "email": foundUser.email,
                                    "name": foundUser.name
                                });
                            }
                        }
                    }

                    let classInfo: SongServer.API.ClassroomInfo;
                    if (role === "student") {
                        classInfo = {
                            "role": "student",
                            "code": info.code,
                            "name": info.name,
                            "playlist": songs == null ? null : songs.filter((s) => s.source !== "unknown").map((s) => {
                                if (s.source === "youtube") {
                                    return {
                                        "id": s.videoID,
                                        "source": "youtube"
                                    };
                                }
                                throw new Error("This shouldn't happen");
                            })
                        };
                    }
                    else {
                        let tempSongs = playlist == null ? null : info.playlist!.overrides.filter((o) => o.type == "add" && o.song.source !== "unknown").map((o) => {
                            if (o.type === "add") {
                                if (o.song.source === "youtube") {
                                    return {
                                        "id": o.song.videoID,
                                        "source": "youtube"
                                    };
                                }
                            }
                            throw new Error("This shouldn't happen");
                        });

                        classInfo = {
                            "role": role,
                            "name": info.name,
                            "code": info.code,
                            "students": students,
                            "playlist": songs == null ? null : songs.filter((s) => s.source !== "unknown").map((s) => {
                                if (s.source === "youtube") {
                                    return {
                                        "id": s.videoID,
                                        "source": "youtube",
                                        "is_temp": tempSongs!.findIndex((p) => p.source === "youtube" && p.id === s.videoID) > -1,
                                        "requested_by": s.requestedBy ?? null
                                    };
                                }
                                throw new Error("This shouldn't happen");
                            })
                        }
                    }

                    result.push(classInfo);
                }
                catch {
                    // todo: add exception handling
                }
            }

            let response: SongServer.API.Responses.ClassroomsAPIResponse = {
                data: result,
                success: true
            }
            // send success api response
            res.send(response);
        });

        router.post("/", async (req, res) => {
            await this.handleRes(res, this.createClassroomRequest(req));            
        });

        // handles requesting for a classroom via a code
        // todo: maybe hide or change some things for the response (e.g. student emails)
        router.get("/:code", async (req, res) => {
            let session: SongServer.Data.Session;
            try {
                session = await this.authorizeFromRequest(req);
            }
            catch (err) {
                let message: string;
                if (err instanceof Error) {
                    message = err.message;
                }
                else {
                    message = new String(err) as string;
                }

                res.status(403).send({
                    "message": "Error whilst authorizing: " + message,
                    "success": false
                });
                return;
            }

            let user: SongServer.Data.User;
            try {
                user = await this.userDatabase.get(session.email);
            }
            catch(err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            // only teachers may add a new classroom
            if (user.type != "teacher") {
                res.status(403).send({
                    "message": "This endpoint is only available to teachers",
                    "success": false
                });
                return; // prevent other code from running
            }

            this.logger.debug("Received request for classroom with code " + req.params.code);
            let classroom: SongServer.Data.Classroom;
            try {
                classroom = await this.classroomDatabase.get(req.params.code);
            }
            catch (err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error fetching class: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            // todo: add student and teacher views
            

            let students: SongServer.API.StudentInfo[] = [];
            try {
                for (let studentIndex = 0; studentIndex < classroom.students.length; studentIndex++) {
                    let foundUser = await this.userDatabase.get(classroom.students[studentIndex]);
                    if (foundUser.type === "student") {
                        students.push({
                            "email": foundUser.email,
                            "name": foundUser.name,
                            "type": "student",
                            "currentClass": foundUser.currentClass
                        });
                    }
                }
            }
            catch {
                // todo: catch exceptions
            }

            let playlist: SongServer.Data.Playlist | null = null;
            if (classroom.playlist != null) {
                try {
                    playlist = await this.playlistDatabase.getPlaylist(classroom.playlist.playlistOwner, classroom.playlist.playlistID);
                }
                catch {
                    // todo: handle exceptions
                }
            }

            let tempSongs = playlist == null ? [] : classroom.playlist!.overrides.map((s) => s.type === "add" && s.song.source !== "unknown" ? getIDFromSong(s.song) : null)
                .filter((s) => s != null);
            let songs: SongServer.API.ClassroomTeacherSongInfo[] | null = playlist == null ? null : getSongsFromMods(playlist, classroom.playlist!.overrides).map((s) => {
                if (s.source == "unknown") {
                    return {
                        "id": null,
                        "source": "unknown",
                        "requested_by": s.requestedBy ?? null,
                        "is_temp": true
                    };
                }
                let id = getIDFromSong(s);

                return {
                    "id": getIDFromSong(s),
                    "source": s.source,
                    "requested_by": s.requestedBy ?? null,
                    "is_temp": tempSongs.includes(id)
                };
            });

            // success api response (we may need to change it)
            let result: SongServer.API.ClassroomInfo = {
                "code": classroom.code,
                "name": classroom.name,
                "role": "teacher",
                "students": students,
                "playlist": songs
            };

            let response: SongServer.API.Responses.ClassroomAPIResponse = {
                "data": result,
                "success": true
            }

            res.send(response);
        });

        router.patch("/:code", async (req, res) => {
            let session: SongServer.Data.Session;
            try {
                session = await this.authorizeFromRequest(req);
            }
            catch (err) {
                let message: string;
                if (err instanceof Error) {
                    message = err.message;
                }
                else {
                    message = new String(err) as string;
                }

                res.status(403).send({
                    "message": "Error whilst authorizing: " + message,
                    "success": false
                });
                return;
            }

            let user: SongServer.Data.User;
            try {
                user = await this.userDatabase.get(session.email);
            }
            catch(err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            // only teachers may add a new classroom
            if (user.type != "teacher") {
                res.status(403).send({
                    "message": "This endpoint is only available to teachers",
                    "success": false
                });
                return; // prevent other code from running
            }

            this.logger.debug("Received request to patch classroom with code " + req.params.code);

            let classroom: SongServer.Data.Classroom;
            try {
                classroom = await this.classroomDatabase.get(req.params.code);
            }
            catch (err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error fetching class: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            let body: SongServer.API.Server.Requests.PatchClassroomRequest = req.body;

            if (body.name != null) {
                if (typeof body.name !== "string" ){
                    // send fail api response
                    res.status(400).send({
                        "message": "The name field must be of type string",
                        "success": false
                    });
                    return; // prevent other code from running
                }

                classroom.name = body.name;
            }

            // success api response (we may need to change it)
            let result: boolean = await this.classroomDatabase.set(req.params.code, classroom);
            
            res.send({
                "data": result,
                "success": true
            });
        });

        router.get("/:code/settings", async (req, res) => {
            let session: SongServer.Data.Session;
            try {
                session = await this.authorizeFromRequest(req);
            }
            catch (err) {
                let message: string;
                if (err instanceof Error) {
                    message = err.message;
                }
                else {
                    message = new String(err) as string;
                }

                res.status(403).send({
                    "message": "Error whilst authorizing: " + message,
                    "success": false
                });
                return;
            }

            let user: SongServer.Data.User;
            try {
                user = await this.userDatabase.get(session.email);
            }
            catch(err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            this.logger.debug("Received request for classroom settings with code " + req.params.code);
            let classroom: SongServer.Data.Classroom;
            try {
                classroom = await this.classroomDatabase.get(req.params.code);
            }
            catch (err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error fetching class: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            // success api response (we may need to change it)
            let result: SongServer.API.ClassroomSettingsInfo = classroom.settings;

            let response: SongServer.API.Responses.ClassroomSettingsAPIResponse = {
                "data": result,
                "success": true
            }

            res.send(response);
        });

        router.patch("/:code/settings", async (req, res) => {
            let session: SongServer.Data.Session;
            try {
                session = await this.authorizeFromRequest(req);
            }
            catch (err) {
                let message: string;
                if (err instanceof Error) {
                    message = err.message;
                }
                else {
                    message = new String(err) as string;
                }

                res.status(403).send({
                    "message": "Error whilst authorizing: " + message,
                    "success": false
                });
                return;
            }

            let user: SongServer.Data.User;
            try {
                user = await this.userDatabase.get(session.email);
            }
            catch(err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            // only teachers may add a new classroom
            if (user.type != "teacher") {
                res.status(403).send({
                    "message": "This endpoint is only available to teachers",
                    "success": false
                });
                return; // prevent other code from running
            }

            this.logger.debug("Received request for setting classroom submission status with code " + req.params.code);

            let classroom: SongServer.Data.Classroom;
            try {
                classroom = await this.classroomDatabase.get(req.params.code);
            }
            catch (err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error fetching class: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            let body: SongServer.API.Server.Requests.PatchClassroomSettingsRequest = req.body;
            if (body.joinable != null) {
                if (typeof body.joinable !== "boolean") {
                    
                    // send fail api response
                    res.status(400).send({
                        "message": "The joinable field must be of type boolean",
                        "success": false
                    });
                    return; // prevent other code from running
                }
                classroom.settings.joinable = body.joinable;
            }

            if (body.allowSongSubmission != null) {
                if (typeof body.allowSongSubmission !== "boolean") {
                    
                    // send fail api response
                    res.status(400).send({
                        "message": "The allowSongSubmission field must be of type boolean",
                        "success": false
                    });
                    return; // prevent other code from running
                }
                classroom.settings.allowSongSubmission = body.allowSongSubmission;
            }

            // success api response (we may need to change it)
            let result: boolean = await this.classroomDatabase.set(req.params.code, classroom);

            res.send({
                "data": result,
                "success": true
            });
        });

        router.post("/:code/students/", async (req, res) => {
            let session: SongServer.Data.Session;
            try {
                session = await this.authorizeFromRequest(req);
            }
            catch (err) {
                let message: string;
                if (err instanceof Error) {
                    message = err.message;
                }
                else {
                    message = new String(err) as string;
                }

                res.status(403).send({
                    "message": "Error whilst authorizing: " + message,
                    "success": false
                });
                return;
            }

            let user: SongServer.Data.User;
            try {
                user = await this.userDatabase.get(session.email);
            }
            catch(err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            // only students may join a class
            if (user.type != "student") {
                res.status(403).send({
                    "message": "This endpoint is only available to students",
                    "success": false
                });
                return; // prevent other code from running
            }

            let classroom: SongServer.Data.Classroom;
            try {
                classroom = await this.classroomDatabase.get(req.params.code);
            }
            catch (err) {
                // err is type any because promises can reject with any value.
                // check if it's an actual error object
                if (err instanceof Error) {
                    // send fail api response
                    res.status(404).send({
                        "message": "Error fetching class: " + err.message,
                        "success": false
                    });

                    return; // prevent other code from running
                }
                // otherwise convert to string
                let message = new String(err);

                // send fail api response
                res.status(404).send({
                    "message": message,
                    "success": false
                });
                return; // prevent other code from running
            }

            if (!classroom.settings.joinable) {
                res.status(403).send({
                    "message": "The class can't be joined",
                    "success": false
                });
                return;
            }

            user.currentClass = req.params.code;

            classroom.students.push(user.email);
            try {
                await this.userDatabase.set(user.email, user);
                await this.classroomDatabase.set(req.params.code, classroom);

                res.send({
                    "success": true,
                    "data": true
                });
            }
            catch (err) {
                // todo: handler error
                res.status(500).send({
                    "success": false,
                    "message": "internal server error"
                });
            }
        });

        router.get("/:code/playlist", async (req, res) => {
            await this.handleRes(res, this.getPlaylist(req));
        });

        router.post("/:code/playlist", async (req, res) => {
            await this.handleRes(res, this.setPlaylist(req));
        });

        router.delete("/:code/playlist", async (req, res) => {
            await this.handleRes(res, this.deletePlaylist(req));
        });

        router.post("/:code/playlist/songs", async (req, res) => {
            await this.handleRes(res, this.addSongToPlaylist(req));
        });

        router.patch("/:code/playlist/songs", async (req, res) => {
            await this.handleRes(res, this.modifySongInPlaylist(req));
        });

        router.delete("/:code/playlist/songs", async (req, res) => {
            await this.handleRes(res, this.deleteSongFromPlaylist(req));
        });

        router.post("/:code/playlist/shuffle", async (req, res) => {
            await this.handleRes(res, this.shufflePlaylist(req));
        });

        router.delete("/:code/students/:studentEmail", async (req, res) => {
            await this.handleRes(res, this.removeStudentFromClassroom(req));
        })
    }

    public async removeStudentFromClassroom(req: Request): APIResponseInfo<SongServer.API.Responses.ClassroomRemoveStudentAPIResponse> {
        let info = await this._verifySession<SongServer.API.Responses.ClassroomRemoveStudentAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { user } = info;

        if (user.type !== "teacher") {
            return {
                "success": false,
                "status": 403,
                "message": "This endpoint is only available to teachers"
            }
        }

        let code = req.params.code;
        let classroom: SongServer.Data.Classroom;
        try {
            classroom = await this.classroomDatabase.get(code);
        }
        catch(err) {
            let message: string;
            if (err instanceof Error) {
                message = err.message;
            }
            else {
                message = new String(err) as string;
            }

            return {
                "success": false,
                "status": 404,
                "message": "Classroom not found"
            };
        }

        let studentIndex = classroom.students.indexOf(req.params.studentEmail);
        if (studentIndex == -1) {
            return {
                "success": false,
                "status": 404,
                "message": "Student isn't in the classroom"
            };
        }

        delete classroom.students[studentIndex];
        await this.classroomDatabase.set(code, classroom);
        return {
            "success": true,
            "data": true
        };
    }

    public async createClassroomRequest(req: Request): APIResponseInfo<SongServer.API.Responses.CreateClassroomAPIResponse> {
        let info = await this._verifySession<SongServer.API.Responses.CreateClassroomAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { user } = info;

        this.logger.debug("Received request for all classrooms from email " + user.email);

        // only teachers may add a new classroom
        if (user.type != "teacher") {
            return {
                "status": 403,
                "message": "This endpoint is only available to teachers",
                "success": false
            }
        }

        let body: SongServer.API.Server.Requests.CreateClassroomRequest = req.body;
        if (body.name == null) {
            // send fail api response
            return {
                "status": 400,
                "success": false,
                "message": "A name is required for the class"
            }
        }
        if (typeof body.name !== "string") {
            // send fail api response
            return {
                "status": 400,
                "success": false,
                "message": "The name field must be a string"
            }
        }

        let joinable: boolean = true;
        if (body.joinable != null) {
            if (typeof body.joinable !== "boolean") {
                // send fail api response
                return {
                    "status": 400,
                    "success": false,
                    "message": "The joinable field if provided must be a boolean or null"
                }
            }

            joinable = body.joinable;
        }
        let allowSongSubmissions = true;
        if (body.allowSongSubmissions != null) {
            if (typeof body.allowSongSubmissions !== "boolean") {
                // send fail api response
                return {
                    "status": 400,
                    "success": false,
                    "message": "The allowSongSubmissions field if provided must be a boolean or null"
                }
            }

            allowSongSubmissions = body.allowSongSubmissions;
        }

        let newClassIndex = user.classrooms.length;

        // find the hash function of the email
        // (same as java implementation for string hash function)
        let content = `${newClassIndex}$${user.email}`;

        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            let char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        if (hash < 0) hash = -hash; // convert negative hashs to positive values

        // convert the hash function to a 6 or 7 letter code
        let code = "";
        while (hash > 1) {
            code += String.fromCharCode(65 + hash % 26);
            hash = hash / 26;
        }

        let classroom: SongServer.Data.Classroom = {
            "code": code,
            "name": body.name,
            "teacher": user.email,
            "playlist": null,
            "settings": {
                "allowSongSubmission": allowSongSubmissions,
                "joinable": joinable
            },
            "students": []
        };

        try {
            let added = await this.classroomDatabase.add(code, classroom);
            if (added) {
                user.classrooms.push({
                    "code": code
                });

                await this.userDatabase.set(user.email, user);

                // send success api response
                return {
                    "data": {
                        "code": classroom.code,
                        "name": classroom.name,
                        "playlist": null,
                        "settings": classroom.settings,
                        "teacher": classroom.teacher,
                        "students": classroom.students
                    },
                    "success": true
                };
            }
            else {
                // send failed api response
                return {
                    "success": false,
                    "message": "Failed to add classroom to database",
                    "status": 500
                }
            }
        }
        catch (err) {
            let message: string;
            if (err instanceof Error) {
                message = err.message;
            }
            else {
                message = new String(err) as string;
            }

            this.logger.warn("Error adding classroom: " + message);
            
            // send api error response
            return {
                "status": 500,
                "success": false,
                "message": message
            };
        }
    }

    private async _getPlaylist<T>(req: Request): Promise<GottenPlaylistInfo<T>> {
        let info = await this._verifySession(req);
        if (info.is_response) {
            return {
                "is_response": true,
                "response": info.response
            };
        }

        let { user, session } = info;


        let classroom: SongServer.Data.Classroom;
        try {
            classroom = await this.classroomDatabase.get(req.params.code);
        }
        catch (err) {
            // err is type any because promises can reject with any value.
            // check if it's an actual error object
            if (err instanceof Error) {
                // send fail api response
                return {
                    "is_response": true,
                    "response": {
                        "success": false,
                        "status": 404,
                        "message": err.message
                    }
                };
            }
            // otherwise convert to string
            let message = new String(err);

            // send fail api response
            return {
                "is_response": true,
                "response": {
                    "success": false,
                    "message": message as string,
                    "status": 404
                }
            };
        }

        let playlist: SongServer.Data.Playlist | null = null;

        if (classroom.playlist != null) {
            try {
                playlist = await this.playlistDatabase.getPlaylist(classroom.playlist.playlistOwner, classroom.playlist.playlistID);
            }
            catch(err) {
                return {
                    "is_response": true,
                    "response": {
                        "success": false,
                        "status": 404,
                        "message": "Failed to find playlist with id '" + classroom.playlist.playlistID + "'"
                    }
                };
            }
        }

        return {
            "is_response": false,
            "classroom": classroom,
            "playlist": playlist,
            "session": session,
            "user": user
        };
    }

    public async getPlaylist(req: Request): APIResponseInfo<SongServer.API.Responses.ClassroomPlaylistAPIResponse> {
        let info = await this._getPlaylist<SongServer.API.Responses.ClassroomPlaylistAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { user, classroom, playlist } = info;
        if (playlist == null) {
            return {
                "success": false,
                "message": "Class doesn't contain a playlist",
                "status": 404
            };
        }

        let role = user.type;
        if (role === "student") {
            
            let songs: SongServer.API.ClassroomStudentSongInfo[] = getSongsFromMods(playlist, classroom.playlist!.overrides).map((s) => {
                if (s.source == "unknown") {
                    return {
                        "id": null,
                        "source": "unknown"
                    };
                }

                return {
                    "id": getIDFromSong(s),
                    "source": s.source
                };
            });

            return {
                "data": {
                    "name": playlist.name,
                    "songs": songs
                },
                "success": true
            };
        }
        else if (role === "teacher") {
            let tempSongs = classroom.playlist == null ? [] : classroom.playlist!.overrides.map((s) => s.type === "add" && s.song.source !== "unknown" ? getIDFromSong(s.song) : null)
                .filter((s) => s != null);
            let songs: SongServer.API.ClassroomTeacherSongInfo[] = getSongsFromMods(playlist, classroom.playlist!.overrides).map((s) => {
                if (s.source == "unknown") {
                    return {
                        "id": null,
                        "source": "unknown",
                        "requested_by": s.requestedBy ?? null,
                        "is_temp": true
                    };
                }
                let id = getIDFromSong(s);

                return {
                    "id": getIDFromSong(s),
                    "source": s.source,
                    "requested_by": s.requestedBy ?? null,
                    "is_temp": tempSongs.includes(id)
                };
            });

            return {
                "data": {
                    "name": playlist.name,
                    "songs": songs
                },
                "success": true
            };
        }

        return {
            "success": false,
            "status": 500,
            "message": "Internal server error: Invalid user type"
        };

    }

    public async setPlaylist(req: Request): APIResponseInfo<SongServer.API.Responses.ClassroomNewPlaylistAPIResponse> {
        let body = req.body as SongServer.API.Server.Requests.SetPlaylistRequest;
        if (body.playlistAuthor == null) {
            return {
                "success": false,
                "message": "Playlist author field is required (playlistAuthor)",
                "status": 400
            };
        }
        if (typeof body.playlistAuthor !== "string") {
            return {
                "success": false,
                "message": "Playlist author field must be a string",
                "status": 400
            };
        }

        if (body.playlistID == null) {
            return {
                "success": false,
                "message": "Playlist id field is required (playlistID)",
                "status": 400
            };
        }

        if (typeof body.playlistID !== "string") {
            return {
                "success": false,
                "message": "Playlist id field must be a string",
                "status": 400
            };
        }

        let info = await this._getPlaylist<SongServer.API.Responses.ClassroomNewPlaylistAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { classroom, user } = info;

        if (user.type !== "teacher") {
            return {
                "success": false,
                "message": "This endpoint is only available to teachers",
                "status": 401
            };
        }

        let playlist: SongServer.Data.Playlist;
        try {
            playlist = await this.playlistDatabase.getPlaylist(body.playlistAuthor, body.playlistID);
        }
        catch (err) {
            return {
                "success": false,
                "message": "Failed to fetch playlist provided",
                "status": 404
            }
        }

        classroom.playlist = {
            "overrides": [],
            "playlistID": body.playlistID,
            "playlistOwner": body.playlistAuthor,
            "songPosition": 0
        };

        await this.classroomDatabase.set(req.params.code, classroom);

        let tempSongs = classroom.playlist == null ? [] : classroom.playlist!.overrides.map((s) => s.type === "add" && s.song.source !== "unknown" ? getIDFromSong(s.song) : null)
            .filter((s) => s != null);
        let songs: SongServer.API.ClassroomTeacherSongInfo[] = getSongsFromMods(playlist, classroom.playlist!.overrides).map((s) => {
            if (s.source == "unknown") {
                return {
                    "id": null,
                    "source": "unknown",
                    "requested_by": s.requestedBy ?? null,
                    "is_temp": true
                };
            }
            let id = getIDFromSong(s);

            return {
                "id": getIDFromSong(s),
                "source": s.source,
                "requested_by": s.requestedBy ?? null,
                "is_temp": tempSongs.includes(id)
            };
        });

        return {
            "success": true,
            "data": {
                "name": playlist.name,
                "songs": songs
            }
        };
    }

    public async deletePlaylist(req: Request): APIResponseInfo<SongServer.API.Responses.ClassroomDeletePlaylistAPIResponse> {
        let info = await this._getPlaylist<SongServer.API.Responses.ClassroomDeletePlaylistAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { classroom, user } = info;

        if (user.type !== "teacher") {
            return {
                "success": false,
                "message": "This endpoint is only available to teachers",
                "status": 401
            };
        }

        classroom.playlist = null;

        await this.classroomDatabase.set(req.params.code, classroom);

        return {
            "success": true,
            "data": true
        };
    }

    public async addSongToPlaylist(req: Request): APIResponseInfo<SongServer.API.Responses.ClassroomAddSongAPIResponse> {
        let body: SongServer.API.Server.Requests.AddSongToClassroomPlaylistRequest = req.body;
        if (body.source == null) {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'source' is required for this request"
            }
        }

        if (typeof body.source !== "string") {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'source' must be a string"
            }
        }
        
        if (body.songID == null) {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'songID' is required for this request"
            }
        }
        
        if (typeof body.songID !== "string") {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'songID' must be a string"
            }
        }
        
        let info = await this._getPlaylist<SongServer.API.Responses.ClassroomAddSongAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { classroom, user, playlist } = info;
        if (classroom.playlist == null || playlist == null) {
            return {
                "success": false,
                "status": 404,
                "message": "No classroom playlist found!"
            }
        }

        let songInfo: SongServer.Data.Song;
        if (body.source === "youtube") {
            songInfo = {
                "source": "youtube",
                "requestedBy": {
                    "email": user.email,
                    "name": user.name
                },
                "videoID": body.songID
            };
        }
        else {
            return {
                "status": 400,
                "success": false,
                "message": "Song source not supported"
            };
        }

        let allSongs = getSongsFromMods(playlist, classroom.playlist.overrides);
        let alreadyExists = allSongs.findIndex((s) => {
            if (s.source === "unknown") {
                return false;
            }
            let id = getIDFromSong(s);
            if (id === body.songID && s.source === body.source) {
                return true;
            }
        }) > -1;
        if (alreadyExists) {
            return {
                "success": false,
                "status": 400,
                "message": "A song with that id and source is already in the playlist"
            };
        }

        let songCount = allSongs.length;
        classroom.playlist.overrides.push({
            "type": "add",
            "index": songCount,
            "song": songInfo
        });

        await this.classroomDatabase.set(req.params.code, classroom);
        return {
            "success": true,
            "data": true
        };
    }

    public async deleteSongFromPlaylist(req: Request): APIResponseInfo<SongServer.API.Responses.ClassroomRemoveSongAPIResponse> {
        let body: SongServer.API.Server.Requests.RemoveSongToClassroomPlaylistRequest = req.body;
        if (body.source == null) {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'source' is required for this request"
            }
        }

        if (typeof body.source !== "string") {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'source' must be a string"
            }
        }
        
        if (body.songID == null) {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'songID' is required for this request"
            }
        }
        
        if (typeof body.songID !== "string") {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'songID' must be a string"
            }
        }
        
        let info = await this._getPlaylist<SongServer.API.Responses.ClassroomRemoveSongAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { classroom, user, playlist } = info;
        if (classroom.playlist == null || playlist == null) {
            return {
                "success": false,
                "status": 404,
                "message": "No classroom playlist found!"
            }
        }

        if (user.type !== "teacher") {
            return {
                "status": 401,
                "success": false,
                "message": "This api endpoint is only available to teachers"
            };
        }

        let allSongs = getSongsFromMods(playlist, classroom.playlist.overrides);
        let songIndex = allSongs.findIndex((s) => {
            if (s.source === "unknown") {
                return false;
            }
            let id = getIDFromSong(s);
            if (id === body.songID && s.source === body.source) {
                return true;
            }
        });
        if (songIndex == -1) {
            return {
                "success": false,
                "status": 404,
                "message": "No such song exists"
            };
        };

        classroom.playlist.overrides.push({
            "type": "remove",
            "index": songIndex
        });

        await this.classroomDatabase.set(req.params.code, classroom);

        return {
            "success": true,
            "data": true
        };
    }

    public async modifySongInPlaylist(req: Request): APIResponseInfo<SongServer.API.Responses.ClassroomMoveSongAPIResponse> {
        let body: SongServer.API.Server.Requests.ModifySongInClassroomPlaylistRequest = req.body;
        if (body.source == null) {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'source' is required for this request"
            }
        }

        if (typeof body.source !== "string") {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'source' must be a string"
            }
        }
        
        if (body.songID == null) {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'songID' is required for this request"
            }
        }
        
        if (typeof body.songID !== "string") {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'songID' must be a string"
            }
        }
        
        if (body.newPosition == null) {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'newPosition' is required for this request"
            }
        }
        
        if (typeof body.newPosition !== "number") {
            return {
                "status": 400,
                "success": false,
                "message": "A json field of 'newPosition' must be a number"
            }
        }

        let info = await this._getPlaylist<SongServer.API.Responses.ClassroomRemoveSongAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { classroom, user, playlist } = info;
        if (classroom.playlist == null || playlist == null) {
            return {
                "success": false,
                "status": 404,
                "message": "No classroom playlist found!"
            }
        }

        if (user.type !== "teacher") {
            return {
                "status": 401,
                "success": false,
                "message": "This api endpoint is only available to teachers"
            };
        }

        let allSongs = getSongsFromMods(playlist, classroom.playlist.overrides);
        let songIndex = allSongs.findIndex((s) => {
            if (s.source === "unknown") {
                return false;
            }
            let id = getIDFromSong(s);
            if (id === body.songID && s.source === body.source) {
                return true;
            }
        });
        if (songIndex == -1) {
            return {
                "success": false,
                "status": 404,
                "message": "No such song exists"
            };
        };

        if (body.newPosition < 0 || body.newPosition >= allSongs.length) {
            return {
                "status": 400,
                "success": false,
                "message": "New position is outside the bounds of the song array"
            };
        }

        classroom.playlist.overrides.push({
            "type": "move",
            "index": songIndex,
            "newIndex": body.newPosition
        });

        await this.classroomDatabase.set(req.params.code, classroom);
        return {
            "data": true,
            "success": true
        };
    }

    public async shufflePlaylist(req: Request): APIResponseInfo<SongServer.API.Responses.ClassroomShufflePlaylistAPIResponse> {
        let info = await this._getPlaylist<SongServer.API.Responses.ClassroomShufflePlaylistAPIResponse>(req);
        if (info.is_response) {
            return info.response;
        }

        let { classroom, playlist, user } = info;

        if (user.type !== "teacher") {
            return {
                "success": false,
                "status": 401,
                "message": "This endpoint is only available to teachers"
            };
        }

        if (classroom.playlist == null || playlist == null) {
            return {
                "success": false,
                "status": 404,
                "message": "Playlist not found"
            };
        }

        let songs = getSongsFromMods(playlist, classroom.playlist.overrides);
        let newSongs = [...songs];

        for (let i = 0; i < newSongs.length; i++) {
            // max length to pull from. decreases as loop goes on so we dont have to store
            // every item in seperate array. We will delete the song, and add it to the end.
            let maxLength = newSongs.length - i;
            let randomSong = newSongs.splice(Math.floor(Math.random() * maxLength), 1)[0];
            newSongs.push(randomSong);
        }

        let newOverrides: SongServer.Data.ClassroomPlaylistSongOverride[] = [];

        function getSongHash(song: SongServer.Data.ClassroomPlaylistSong) {
            let id = getIDFromSong(song);
            let source = song.source;
            let songHash = source + "-" + id;

            return songHash;
        }
        let newSongHashes = newSongs.map((s) => getSongHash(s));
        let playlistHashes = playlist.songs.map((s) => getSongHash(s));
        let songHashes: string[] = [];

        for (let i = 0; i < playlistHashes.length; i++) {
            let hash = playlistHashes[i];
            let exists = false;
            for (let j = 0; j < newSongHashes.length; j++) {
                if (newSongHashes[j] == hash) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                newOverrides.push({
                    "type": "remove",
                    "index": i
                });
            }
            else {
                songHashes.push(hash);
            }
        }

        for (let i = 0; i < newSongHashes.length; i++) {
            let song = newSongs[i];
            let hash = newSongHashes[i];
            let exists = false;
            for (let j = 0; j < songHashes.length; j++) {
                if (songHashes[j] == hash) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                newOverrides.push({
                    "type": "add",
                    "song": song,
                    "index": songHashes.length
                });
                songHashes.push(hash);
            }
        }

        // arrays should be same size now
        for (let i = 0; i < songHashes.length; i++) {
            if (newSongHashes[i] != songHashes[i]) {
                let j = songHashes.indexOf(newSongHashes[i]);
                newOverrides.push({
                    "type": "move",
                    "index": j,
                    "newIndex": i
                });
                let s = songHashes.splice(j, 1)[0];
                songHashes.splice(i, 0, s)
            }
        }

        classroom.playlist.overrides = newOverrides;
        await this.classroomDatabase.set(req.params.code, classroom);

        return {
            "success": true,
            "data": {
                "name": playlist.name,
                "songs": newSongs.map((s, i) => {
                    if (s.source === "unknown") {
                        return {
                            "requested_by": s.requestedBy,
                            "is_temp": true,
                            "source": "unknown",
                            "id": null
                        };
                    }
                    else if (s.source == "youtube") {
                        return {
                            "id": s.videoID,
                            "is_temp": !playlistHashes.includes(newSongHashes[i]),
                            "requested_by": s.requestedBy,
                            "source": "youtube"
                        };
                    }
                    throw new Error("Shouldn't reach this point")
                })
            }
        }
    }
}
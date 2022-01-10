import { Router } from "express";
import DataBase from "../../../database/DataBase";
import SimpleJSONDataBase from "../../../database/SimpleJSONDataBase";
import { getRoleFromEmail } from "../../Server";
import APIController from "../APIController";
import { APIModel } from "../APIModel";

// to be honest, this will be the type that will need to be refactored the most.

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
                            "name": info.name
                        };
                    }
                    else {
                        classInfo = {
                            "role": role,
                            "name": info.name,
                            "code": info.code,
                            "students": students
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
                        "message": "Error adding classrooms to teacher: " + err.message,
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

            let body: SongServer.API.Server.Requests.CreateClassroomRequest = req.body;
            if (body.name == null) {
                // send fail api response
                res.status(400).send({
                    "message": "A name is required for the class",
                    "success": false
                });

                return; // prevent other code from running
            }
            if (typeof body.name !== "string") {
                // send fail api response
                res.status(400).send({
                    "message": "The name field must be a string",
                    "success": false
                });

                return; // prevent other code from running
            }

            let joinable: boolean = true;
            if (body.joinable != null) {
                if (typeof body.joinable !== "boolean") {
                    // send fail api response
                    res.status(400).send({
                        "message": "The joinable field if provided must be a boolean or null",
                        "success": false
                    });

                    return; // prevent other code from running
                }

                joinable = body.joinable;
            }
            let allowSongSubmissions = true;
            if (body.allowSongSubmissions != null) {
                if (typeof body.allowSongSubmissions !== "boolean") {
                    // send fail api response
                    res.status(400).send({
                        "message": "The allowSongSubmissions field if provided must be a boolean or null",
                        "success": false
                    });

                    return; // prevent other code from running
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
                "teacher": email,
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

                    await this.userDatabase.set(email, user);

                    // send success api response
                    res.send({
                        "data": classroom,
                        "success": true
                    });
                }
                else {
                    // send failed api response
                    res.status(500).send({
                        "message": "Failed to add classroom to database",
                        "success": false
                    });
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
                res.status(500).send({
                    "message": message,
                    "success": false
                });
            }

            
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

            // success api response (we may need to change it)
            let result: SongServer.API.ClassroomInfo = {
                "code": classroom.code,
                "name": classroom.name,
                "role": "teacher",
                "students": students
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

        router.patch("/:code/settings", async (req, res) => {let session: SongServer.Data.Session;
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
            }


        });
    }
}
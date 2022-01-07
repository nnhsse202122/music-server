import { Router } from "express";
import DataBase from "../../../database/DataBase";
import SimpleJSONDataBase from "../../../database/SimpleJSONDataBase";
import APIController from "../APIController";
import { APIModel } from "../APIModel";

// to be honest, this will be the type that will need to be refactored the most.

// temp container types to hold classroom information until we set up
// replit database
type Classroom = {
    /** The class code */
    code: string,
    /** The list of students by email */
    students: string[],
    /** Classroom settings */
    settings: ClassroomSettings,
}

type ClassroomSettings = {
    allowSongSubmission: boolean,
    enabled: boolean,
    code: string,
    students: string[]
};

export default class ClassroomModel extends APIModel<ClassroomModel> {

    private _classroomDB: DataBase<string, Classroom>;

    public constructor(controller: APIController) {
        // api version 1
        super(controller, "/classroom", 1);

        this._classroomDB = new SimpleJSONDataBase();
    }

    protected override initRoutes(router: Router): void {
        
        // handles requesting for a classroom via a code
        // todo: maybe hide or change some things for the response (e.g. student emails)
        router.get("/:code", async (req, res) => {
            this.logger.debug("Received request for classroom with code " + req.params.code);
            let classroom: Classroom;
            try {
                classroom = await this._classroomDB.get(req.params.code);
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
            let result: Classroom = classroom;

            res.send({
                "data": result,
                "success": true
            });
        });

        router.get("/:code/submissions", async (req, res) => {
            this.logger.debug("Received request for classroom submission status with code " + req.params.code);
            let classroom: Classroom;
            try {
                classroom = await this._classroomDB.get(req.params.code);
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
            let result: boolean = classroom.settings.allowSongSubmission;

            res.send({
                "data": result,
                "success": true
            });
        });

        router.patch("/:code/submissions", async (req, res) => {
            this.logger.debug("Received request for setting classroom submission status with code " + req.params.code);

            let classroom: Classroom;
            try {
                classroom = await this._classroomDB.get(req.params.code);
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

            classroom.settings.allowSongSubmission = req.query.enabled == "true"; 
            // success api response (we may need to change it)
            let result: boolean = await this._classroomDB.set(req.params.code, classroom);

            res.send({
                "data": result,
                "success": true
            });
        })
    }
}
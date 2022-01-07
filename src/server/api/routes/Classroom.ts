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

    private _classroomDB: DataBase<string, ClassroomSettings>;

    public constructor(controller: APIController) {
        // api version 1
        super(controller, "/classroom", 1);

        this._classroomDB = new SimpleJSONDataBase();
    }

    protected override initRoutes(router: Router): void {
        
    }
}
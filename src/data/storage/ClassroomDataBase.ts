import Classroom from "../classrooms/Classroom";
import SongAdded from "../classrooms/SongAdded";
import SongDeleted from "../classrooms/SongDeleted";
import SongModificationType from "../classrooms/SongModificationType";
import SongMoved from "../classrooms/SongMoved";
import CollectionDataBase from "./CollectionDataBase";
import IClassroom from "./interfaces/IClassroom";
import ClassroomModel from "./models/ClassroomModel";
import { i32 as int } from "typed-numbers";

function dbClassToClassroom(classroom: IClassroom): Classroom {
    return {
        "code": classroom._id as string,
        "name": classroom.name,
        "owner": classroom.owner,
        "playlist": {
            "currentSongPosition": classroom.playlist.currentSongPosition,
            "playlist": classroom.playlist.playlist == null ? null : {
                "id": classroom.playlist.playlist.id,
                "owner": classroom.playlist.playlist.owner
            },
            "modifications": classroom.playlist.modifications.map((mod) => {
                if (mod.type === SongModificationType.ADDED) {
                    let addMod: SongAdded = {
                        "index": mod.index,
                        "song": {
                            "id": mod.song.id,
                            "requested_by": {
                                "email": mod.song.requested_by.email,
                                "name": mod.song.requested_by.name
                            },
                            "source": mod.song.source,
                            "title": mod.song.title
                        },
                        "type": SongModificationType.ADDED
                    };
                    return addMod;
                }
                else if (mod.type === SongModificationType.MOVED) {
                    let movedMod: SongMoved = {
                        "old_index": mod.old_index,
                        "new_index": mod.new_index,
                        "type": SongModificationType.MOVED
                    };
                    return movedMod;
                }
                else if (mod.type === SongModificationType.DELETED) {
                    let deletedMod: SongDeleted = {
                        "index": mod.index,
                        "type": SongModificationType.DELETED
                    };
                    return deletedMod;
                }
                else {
                    return {
                        "type": SongModificationType.NONE
                    };
                }
            })
        },
        "settings": {
            "allowSongSubmissions": classroom.settings.allowSongSubmissions,
            "joinable": classroom.settings.joinable,
            "playlistVisible": classroom.settings.playlistVisible,
            "submissionsRequireTokens": classroom.settings.submissionsRequireTokens,
            "priorityCost": classroom.settings.priorityCost ?? int(0),
            "likesEnabled": classroom.settings.likesEnabled ?? false,
            "priorityEnabled": classroom.settings.priorityEnabled ?? false,
            "likesVisible": classroom.settings.likesVisible ?? false,
        },
        "students": classroom.students.map((student) => {
            return {
                "email": student.email,
                "name": student.name,
                "tokens": student.tokens,
                "likes": student.likes ?? int(0)
            };
        })
    };
}

function classroomToDBClass(classroom: Classroom): IClassroom {
    return new ClassroomModel({
        "name": classroom.name,
        "owner": classroom.owner,
        "playlist": {
            "currentSongPosition": classroom.playlist.currentSongPosition,
            "playlist": classroom.playlist.playlist == null ? null : {
                "id": classroom.playlist.playlist.id,
                "owner": classroom.playlist.playlist.owner
            },
            "modifications": classroom.playlist.modifications.map((mod) => {
                if (mod.type === SongModificationType.ADDED) {
                    let addMod: SongAdded = {
                        "index": mod.index,
                        "song": {
                            "id": mod.song.id,
                            "requested_by": {
                                "email": mod.song.requested_by.email,
                                "name": mod.song.requested_by.name
                            },
                            "source": mod.song.source,
                            "title": mod.song.title
                        },
                        "type": SongModificationType.ADDED
                    };
                    return addMod;
                }
                else if (mod.type === SongModificationType.MOVED) {
                    let movedMod: SongMoved = {
                        "old_index": mod.old_index,
                        "new_index": mod.new_index,
                        "type": SongModificationType.MOVED
                    };
                    return movedMod;
                }
                else if (mod.type === SongModificationType.DELETED) {
                    let deletedMod: SongDeleted = {
                        "index": mod.index,
                        "type": SongModificationType.DELETED
                    };
                    return deletedMod;
                }
                else {
                    return {
                        "type": SongModificationType.NONE
                    };
                }
            })
        },
        "settings": {
            "allowSongSubmissions": classroom.settings.allowSongSubmissions,
            "joinable": classroom.settings.joinable,
            "playlistVisible": classroom.settings.playlistVisible,
            "submissionsRequireTokens": classroom.settings.submissionsRequireTokens
        },
        "students": classroom.students.map((student) => {
            return {
                "email": student.email,
                "name": student.name,
                "tokens": student.tokens
            };
        }),
        "_id": classroom.code
    });
}

function updateDBClass(classroom: Classroom, classDB: IClassroom): void {
    classDB.name = classroom.name;
    classDB.owner = classroom.owner;
    classDB.playlist.currentSongPosition = classroom.playlist.currentSongPosition;
    classDB.playlist.playlist = classroom.playlist.playlist != null ? {
        "id": classroom.playlist.playlist.id,
        "owner": classroom.playlist.playlist.owner
    } : null;
    classDB.playlist.modifications = classroom.playlist.modifications.map((mod) => {
        if (mod.type === SongModificationType.ADDED) {
            let addMod: SongAdded = {
                "index": mod.index,
                "song": {
                    "id": mod.song.id,
                    "requested_by": {
                        "email": mod.song.requested_by.email,
                        "name": mod.song.requested_by.name
                    },
                    "source": mod.song.source,
                    "title": mod.song.title
                },
                "type": SongModificationType.ADDED
            };
            return addMod;
        }
        else if (mod.type === SongModificationType.MOVED) {
            let movedMod: SongMoved = {
                "old_index": mod.old_index,
                "new_index": mod.new_index,
                "type": SongModificationType.MOVED
            };
            return movedMod;
        }
        else if (mod.type === SongModificationType.DELETED) {
            let deletedMod: SongDeleted = {
                "index": mod.index,
                "type": SongModificationType.DELETED
            };
            return deletedMod;
        }
        else {
            return {
                "type": SongModificationType.NONE
            };
        }
    });
    classDB.settings.allowSongSubmissions = classroom.settings.allowSongSubmissions;
    classDB.settings.joinable = classroom.settings.joinable;
    classDB.settings.playlistVisible = classroom.settings.playlistVisible;
    classDB.settings.submissionsRequireTokens = classroom.settings.submissionsRequireTokens;
    classDB.students = classroom.students.map((student) => {
        return {
            "email": student.email,
            "name": student.name,
            "tokens": student.tokens,
            "likes": student.likes ?? int(0)
        };
    });
}


export default class ClassroomDataBase extends CollectionDataBase<string, Classroom> {

    private async _get(code: string): Promise<IClassroom> {
        let fetchedClassroom = await ClassroomModel.findById(code).exec();
        if (fetchedClassroom === null) {
            throw new Error("No classroom with code '" + code + "'");
        }

        return fetchedClassroom;
    } 

    public async add(code: string, classroom: Classroom): Promise<boolean> {
        if (await this.contains(code)) return false;
        let c = classroomToDBClass(classroom);
        await c.save();
        return true;
    }

    public async set(code: string, classroom: Classroom): Promise<boolean> {
        if (!await this.contains(code)) return false;
        let classDB = await this._get(code);

        updateDBClass(classroom, classDB);
        await classDB.save();

        return true;
    }

    public async contains(code: string): Promise<boolean> {
        return (await ClassroomModel.findById(code).exec()) != null;
    }

    public async get(code: string): Promise<Classroom> {
        return dbClassToClassroom(await this._get(code)); 
    }

    public async delete(code: string): Promise<boolean> {
        if (!await this.contains(code)) return false;
        await ClassroomModel.findByIdAndDelete(code).exec();
        return !await this.contains(code);
    }
}
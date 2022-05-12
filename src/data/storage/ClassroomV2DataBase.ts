import ClassroomV2 from "../classrooms/ClassroomV2";
import CollectionDataBase from "./CollectionDataBase";
import IClassroomV2 from "./interfaces/IClassroomV2";
import ClassroomV2Model from "./models/ClassroomV2Model";
import { i32 as int } from 'typed-numbers';
import ClassroomPlaylistSongV2 from "../classrooms/ClassroomPlaylistV2Song";
import Classroom from "../classrooms/Classroom";
import { getSongsAsClassSongs } from "../extensions/ClassroomPlaylistExtensions";
import DataBaseManager from "./DataBaseManager";
import Role from "../users/Role";
import SongModificationType from "../classrooms/SongModificationType";

function cloneClassroomSong(song: ClassroomPlaylistSongV2): ClassroomPlaylistSongV2 {
    return {
        "id": song.id,
        "requested_by": {
            "email": song.requested_by.email,
            "name": song.requested_by.name
        },
        "likes": song.likes.map((s) => s),
        "source": song.source,
        "title": song.title
    };
}

function dbClassToClassroom(classroom: IClassroomV2): ClassroomV2 {
    return {
        "code": classroom._id as string,
        "name": classroom.name,
        "owner": classroom.owner,
        "playlist": {
            "currentSong": {
                "index": classroom.playlist.currentSong?.index ?? int(0),
                "fromPriority": classroom.playlist.currentSong?.fromPriority ?? false
            },
            "priority": classroom.playlist.priority.map(cloneClassroomSong),
            "songs": classroom.playlist.songs.map(cloneClassroomSong)
        },
        "settings": {
            "allowSongSubmissions": classroom.settings.allowSongSubmissions,
            "joinable": classroom.settings.joinable,
            "playlistVisible": classroom.settings.playlistVisible,
            "submissionsRequireTokens": classroom.settings.submissionsRequireTokens,
            "likesEnabled": classroom.settings.likesEnabled ?? false,
            "priorityEnabled": classroom.settings.priorityEnabled ?? false,
            "priorityCost": classroom.settings.priorityCost ?? int(0),
            "likesVisible": classroom.settings.likesVisible ?? false
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

function classroomToDBClass(classroom: ClassroomV2): IClassroomV2 {
    return new ClassroomV2Model({
        "name": classroom.name,
        "owner": classroom.owner,
        "playlist": {
            "currentSong": {
                "index": classroom.playlist.currentSong?.index ?? int(0),
                "fromPriority": classroom.playlist.currentSong?.fromPriority ?? false
            },
            "priority": classroom.playlist.priority.map(cloneClassroomSong),
            "songs": classroom.playlist.songs.map(cloneClassroomSong)
        },
        "settings": {
            "allowSongSubmissions": classroom.settings.allowSongSubmissions,
            "joinable": classroom.settings.joinable,
            "playlistVisible": classroom.settings.playlistVisible,
            "submissionsRequireTokens": classroom.settings.submissionsRequireTokens,
            "likesEnabled": classroom.settings.likesEnabled,
            "priorityEnabled": classroom.settings.priorityEnabled,
            "priorityCost": classroom.settings.priorityCost,
            "likesVisible": classroom.settings.likesVisible
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

function updateDBClass(classroom: ClassroomV2, classDB: IClassroomV2): void {
    classDB.name = classroom.name;
    classDB.owner = classroom.owner;
    classDB.playlist.currentSong = {
        "index": classroom.playlist.currentSong?.index ?? int(0),
        "fromPriority": classroom.playlist.currentSong?.fromPriority ?? false
    };
    classDB.playlist.priority = classroom.playlist.priority.map(cloneClassroomSong);
    classDB.playlist.songs = classroom.playlist.songs.map(cloneClassroomSong);
    classDB.settings.allowSongSubmissions = classroom.settings.allowSongSubmissions;
    classDB.settings.joinable = classroom.settings.joinable;
    classDB.settings.likesVisible = classroom.settings.likesVisible;
    classDB.settings.likesEnabled = classroom.settings.likesEnabled;
    classDB.settings.priorityEnabled = classroom.settings.priorityEnabled;
    classDB.settings.playlistVisible = classroom.settings.playlistVisible;
    classDB.settings.priorityCost = classroom.settings.priorityCost;
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


export default class ClassroomDataBase extends CollectionDataBase<string, ClassroomV2> {

    private readonly _manager: DataBaseManager;

    public constructor(manager: DataBaseManager) {
        super();
        this._manager = manager;
    }

    private async _get(code: string): Promise<IClassroomV2> {
        let fetchedClassroom = await ClassroomV2Model.findById(code).exec();
        if (fetchedClassroom === null) {
            throw new Error("No classroom with code '" + code + "'");
        }

        return fetchedClassroom;
    } 

    public async add(code: string, classroom: ClassroomV2): Promise<boolean> {
        if (await this.contains(code)) return false;
        let c = classroomToDBClass(classroom);
        await c.save();
        return true;
    }

    public async set(code: string, classroom: ClassroomV2): Promise<boolean> {
        if (!await this.contains(code)) return false;
        let classDB = await this._get(code);

        updateDBClass(classroom, classDB);
        let newClass = await classDB.save();
        console.log(JSON.stringify(newClass, undefined, 4));

        return true;
    }

    public async contains(code: string): Promise<boolean> {
        return (await ClassroomV2Model.findById(code).exec()) != null;
    }

    public async convertV1(classroom: Classroom): Promise<ClassroomV2> {
        return {
            "code": classroom.code,
            "name": classroom.name,
            "owner": classroom.owner,
            "settings": {
                "allowSongSubmissions": classroom.settings.allowSongSubmissions,
                "joinable": classroom.settings.joinable,
                "playlistVisible": classroom.settings.playlistVisible,
                "submissionsRequireTokens": classroom.settings.submissionsRequireTokens,
                "priorityEnabled": false,
                "likesEnabled": false,
                "priorityCost": int(0),
                "likesVisible": false
            },
            "students": classroom.students.map((student) => {
                return {
                    "email": student.email,
                    "name": student.name,
                    "tokens": student.tokens,
                    "likes": student.likes ?? 0
                };
            }),
            "playlist": {
                "currentSong": {
                    "fromPriority": false,
                    "index": classroom.playlist.currentSongPosition
                },
                "songs": (await getSongsAsClassSongs(classroom.playlist, this._manager.playlists, classroom.owner, Role.Teacher))
                    .filter((song) => song.modification?.type != SongModificationType.DELETED)
                    .map((song) => {
                        return {
                            "id": song.id,
                            "title": song.title,
                            "source": song.source,
                            "requested_by": {
                                "email": song.requested_by!.email,
                                "name": song.requested_by!.name
                            },
                            "likes": []
                        };
                    }),
                "priority": []
            }
        }
    }

    public async get(code: string): Promise<ClassroomV2> {
        if (!await this.contains(code)) {
            let v1 = await this._manager.classrooms.get(code);
            if (v1 != null) {
                let v2 = await this.convertV1(v1);
                await this.add(v2.code, v2);
                return v2;
            }
            throw new Error("No classroom with code '" + code + "'");
        }
        return dbClassToClassroom(await this._get(code)); 
    }

    public async delete(code: string): Promise<boolean> {
        if (!await this.contains(code)) return false;
        await ClassroomV2Model.findByIdAndDelete(code).exec();
        return !await this.contains(code);
    }
}
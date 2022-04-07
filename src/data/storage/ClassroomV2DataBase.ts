import ClassroomV2 from "../classrooms/ClassroomV2";
import CollectionDataBase from "./CollectionDataBase";
import IClassroomV2 from "./interfaces/IClassroomV2";
import ClassroomV2Model from "./models/ClassroomV2Model";
import { i32 as int } from 'typed-numbers';
import ClassroomPlaylistSongV2 from "../classrooms/ClassroomPlaylistV2Song";

function cloneClassroomSong(song: ClassroomPlaylistSongV2): ClassroomPlaylistSongV2 {
    return {
        "id": song.id,
        "requested_by": {
            "email": song.requested_by.email,
            "name": song.requested_by.name
        },
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
            "songs": classroom.playlist.priority.map(cloneClassroomSong)
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
            "songs": classroom.playlist.priority.map(cloneClassroomSong)
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

function updateDBClass(classroom: ClassroomV2, classDB: IClassroomV2): void {
    classDB.name = classroom.name;
    classDB.owner = classroom.owner;
    classDB.playlist.currentSong = {
        "index": classroom.playlist.currentSong?.index ?? int(0),
        "fromPriority": classroom.playlist.currentSong?.fromPriority ?? false
    };
    classDB.playlist.priority = classroom.playlist.priority.map(cloneClassroomSong);
    classDB.playlist.songs = classroom.playlist.priority.map(cloneClassroomSong);
    classDB.settings.allowSongSubmissions = classroom.settings.allowSongSubmissions;
    classDB.settings.joinable = classroom.settings.joinable;
    classDB.settings.playlistVisible = classroom.settings.playlistVisible;
    classDB.settings.submissionsRequireTokens = classroom.settings.submissionsRequireTokens;
    classDB.students = classroom.students.map((student) => {
        return {
            "email": student.email,
            "name": student.name,
            "tokens": student.tokens
        };
    });
}


export default class ClassroomDataBase extends CollectionDataBase<string, ClassroomV2> {

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
        await classDB.save();

        return true;
    }

    public async contains(code: string): Promise<boolean> {
        return (await ClassroomV2Model.findById(code).exec()) != null;
    }

    public async get(code: string): Promise<ClassroomV2> {
        return dbClassToClassroom(await this._get(code)); 
    }

    public async delete(code: string): Promise<boolean> {
        if (!await this.contains(code)) return false;
        await ClassroomV2Model.findByIdAndDelete(code).exec();
        return !await this.contains(code);
    }
}
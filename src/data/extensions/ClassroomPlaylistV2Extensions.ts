import ClassroomPlaylistV2 from "../classrooms/ClassroomPlaylistV2";
import { i32 as int } from "typed-numbers";
import seedrandom from "seedrandom";
import ClassroomPlaylistSongV2 from "../classrooms/ClassroomPlaylistV2Song";
import SongStudentViewV2 from "../classrooms/SongStudentViewV2";
import SongTeacherViewV2 from "../classrooms/SongTeacherViewV2";
import Role from "../users/Role";
import ClassroomSongV2 from "../classrooms/ClassroomSongV2";

export function deleteSong(playlist: ClassroomPlaylistV2, index: int): void {
    let song = playlist.songs[index];
    if (song == null) return console.warn("Song is not exist! This is not okay! Index: " + index);

    for (let i = 0; i < playlist.priority.length; i++) {
        if (playlist.priority[i].id === song.id && playlist.priority[i].source === song.source) {
            playlist.priority.splice(i, 1);
            return;
        }
    }

    playlist.songs.splice(index, 1);

    if (playlist.currentSong.index !== index) {
        return;
    }

    let fromPriority = playlist.currentSong.fromPriority;
    let songIndex: number;


    // todo: migrate to another methoed because this is literally the code
    //       for the next song
    if (fromPriority) {
        playlist.priority.splice(0, 1);

        fromPriority = fromPriority && playlist.priority.length > 0;

        if (fromPriority) {
            let prioritySong = playlist.priority[0];
            songIndex = playlist.songs.findIndex((song) => {
                return song.id == prioritySong.id && song.source == prioritySong.source;
            });
        }
        else if (playlist.currentSong.index > -1) {
            songIndex = (playlist.currentSong.index + 1) % playlist.songs.length;
        }
        else {
            return;
        }
    }
    else if (playlist.songs.length === 0) {
        songIndex = 0;
    }
    else {
        songIndex = (playlist.currentSong.index + 1) % playlist.songs.length;
    }

    if (isNaN(songIndex)) {
        console.error("Attempted to delete song, and got NaN for songIndex!");
        throw new TypeError("Attempted to delete song, and got NaN for songIndex!");
    }

    playlist.currentSong = {
        "fromPriority": fromPriority,
        "index": int(songIndex)
    };
}

export function shuffleSongs(playlist: ClassroomPlaylistV2): void {
    // for some reason the reference to the current song gets lost sometimes when shuffling
    // why is this happening?
    // todo: find out why
    // todo: fix this bug

    // create a map to map all indexes of the original songs to the shuffled songs
    let indexMap: number[] = [];
    let random = seedrandom();
    for (let i = 0; i < playlist.songs.length; i++) {
        indexMap.push(i);
    }

    // shuffle the map
    for (let i = 0; i < indexMap.length; i++) {
        let randomIndex = Math.floor(random() * (indexMap.length - i));
        indexMap.push(...indexMap.splice(indexMap[randomIndex], 1));
    }

    console.log("index map:");
    console.log(indexMap);

    // update the reference to the current song
    playlist.currentSong.index = int(indexMap[playlist.currentSong.index]);

    // update the songs
    let newSongs: ClassroomPlaylistSongV2[] = [];
    for (let i = 0; i < indexMap.length; i++) {
        newSongs.push(playlist.songs[indexMap[i]])
    }
    // yay!
    playlist.songs = newSongs;
}



function getSongsAsStudent(playlist: ClassroomPlaylistV2, email: string): SongStudentViewV2[] {
    return playlist.songs.map((song, index) => {
        return {
            "id": song.id,
            "from_priority": undefined,
            "requested_by": undefined,
            "is_liked": song.likes.includes(email),
            "likes": undefined,
            "source": song.source,
            "title": song.title,
            "position": int(index + 1)
        };
    });
}

function getSongsAsTeacher(playlist: ClassroomPlaylistV2): SongTeacherViewV2[] {
    console.log("The playlist is not sus:\n" + JSON.stringify(playlist));
    return playlist.priority.map((song, index) => {
        return {
            "from_priority": true,
            "position": int(index + 1),
            "id": song.id,
            "requested_by": {
                "email": song.requested_by.email,
                "name": song.requested_by.name
            },
            "likes": int(song.likes.length),
            "is_liked": undefined,
            "source": song.source,
            "title": song.title
        }
    }).concat(playlist.songs.map((song, index) => {
        return {
            "from_priority": false,
            "position": int(index + 1),
            "id": song.id,
            "requested_by": {
                "email": song.requested_by.email,
                "name": song.requested_by.name
            },
            "likes": int(song.likes.length),
            "is_liked": undefined,
            "source": song.source,
            "title": song.title
        };
    }));
}

export function getSongsAsClassSongs(playlist: ClassroomPlaylistV2, role: Role, email: string): ClassroomSongV2[] {
    switch (role) {
        case Role.Teacher:
            return getSongsAsTeacher(playlist);
        case Role.Student:
            return getSongsAsStudent(playlist, email);
    }

    return [];
}
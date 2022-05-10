import ClassroomSong from "../classrooms/ClassroomSong";
import SongDeleted from "../classrooms/SongDeleted";
import SongModification from "../classrooms/SongModification";
import BasicSong from "../playlists/BasicSong";
import Song from "../playlists/Song";
import { i32 as int } from "typed-numbers";
import SongModificationType from "../classrooms/SongModificationType";
import SongAdded from "../classrooms/SongAdded";
import SongMoved from "../classrooms/SongMoved";
import GlobalLogger from "../../util/logging/GlobalLogger";
import ClassroomPlaylist from "../classrooms/ClassroomPlaylist";
import PlaylistDataBase from "../storage/PlaylistDataBase";
import GenericClassroomSong from "../classrooms/GenericClassroomSong";
import SongStudentView from "../classrooms/SongStudentView";
import BasicUser from "../users/BasicUser";
import SongModificationInfo from "../classrooms/SongModificationInfo";
import FullClassroomSongInfo from "../classrooms/FullClassroomSongInfo";
import SongTeacherView from "../classrooms/SongTeacherView";
import Role from "../users/Role";
import SongToAdd from "../classrooms/SongToAdd";
import seedrandom from "seedrandom";
import ClassroomPlaylistV2 from "../classrooms/ClassroomPlaylistV2";
import ClassroomSongV2 from "../classrooms/ClassroomSongV2";
import SongTeacherViewV2 from "../classrooms/SongTeacherViewV2";
import SongStudentViewV2 from "../classrooms/SongStudentViewV2";
import ClassroomPlaylistSongV2 from "../classrooms/ClassroomPlaylistV2Song";


export function generateModifications(originalSongs: Song[], playlist: ClassroomSong[]) {
    // list for storying modifications
    let modSongs: BasicSong[] = [];

    originalSongs.forEach((originalSong) => {
        modSongs.push(originalSong);
    });

    let newMods: SongModification[] = [];

    // check for deleted songs
    let index = 0;
    while (index < modSongs.length) {
        if (playlist.includes(<ClassroomSong>modSongs[index])) {
            index++;
        }
        else {
            let deletedMod: SongDeleted = {
                "index": int(index),
                "type": SongModificationType.DELETED
            };
            newMods.push(deletedMod);
            modSongs.splice(index, 1);
        }
    }

    // add songs
    index = 0;
    while (index < playlist.length) {
        let song = playlist[index];
        let songIndex = modSongs.indexOf(song);

        // not in list of songs
        if (songIndex === -1) {
            // add to end
            if (index >= modSongs.length) {
                modSongs.push(song);
            }
            else {
                modSongs.splice(index, 0, song);
            }

            let addMod: SongAdded = {
                "type": SongModificationType.ADDED,
                "index": int(index),
                "song": {
                    "id": song.id,
                    "requested_by": {
                        "email": song.requested_by!.email,
                        "name": song.requested_by!.name
                    },
                    "source": song.source,
                    "title": song.title
                }
            };
            newMods.push(addMod);
        }
        // song moved
        else if (songIndex != index) {
            let movedMod: SongMoved = {
                "type": SongModificationType.MOVED,
                "old_index": int(songIndex),
                "new_index": int(index)
            };
            newMods.push(movedMod);

            if (index < songIndex) {
                modSongs.splice(songIndex, 1);
                modSongs.splice(index, 0, song);
            }
            else {
                if (index >= modSongs.length) {
                    modSongs.push(song);
                }
                else {
                    modSongs.splice(index, 0, song);
                }
                modSongs.splice(songIndex, 1);
            }
        }
        index++;
    }

    if (modSongs.length !== playlist.length) {
        GlobalLogger.fatal(`NOTICE: Playlist and calculated mod songs aren't the same length! playlist len: ${playlist.length}, mod songs len: ${modSongs.length}. THIS WILL MEAN SHIT IS BROKEN`);
        throw new Error("Assertion failed...");
    }

    return newMods;
}

export async function getSongCount(playlist: ClassroomPlaylist, playlistDB: PlaylistDataBase, classroomOwnerEmail: string): Promise<int> {
    let initialSongCount = (await getSongs(playlist, playlistDB, classroomOwnerEmail)).length;

    playlist.modifications.forEach((mod) => {
        if (mod.type === SongModificationType.ADDED) {
            initialSongCount++;
        }
        else if (mod.type === SongModificationType.DELETED) {
            initialSongCount--;
        }
    });

    return int(initialSongCount);
}



function getSongsAsBase<TSong extends ClassroomSong>(playlist: ClassroomPlaylist, playlistSongs: Song[], includeDeletedSongs: boolean, songMapper: (song: FullClassroomSongInfo) => TSong): TSong[] {
    let songs: FullClassroomSongInfo[] = [];

    playlistSongs.forEach((song) => {
        songs.push({
            "id": song.id,
            "source": song.source,
            "title": song.title,
            "requested_by": song.requested_by,
            "modification": {
                "playlist_position": song.position,
                "song_position": song.position,
                "type": SongModificationType.NONE
            }
        });
    });

    function getSongCount(): int {
        let count = 0;
        for (let index = 0; index < songs.length; index++) {
            if (songs[index].modification.type !== SongModificationType.DELETED) {
                count++;
            }
        }

        return int(count);
    }

    function getSong(index: int): FullClassroomSongInfo | null {
        let currentIndex = 0;
        for (let i = 0; i < songs.length; i++) {
            if (songs[i].modification.type !== SongModificationType.DELETED) {
                if (currentIndex === index) {
                    return songs[i];
                }
                currentIndex++;
            }
        }

        return null;
    }

    function setSongAtIndex(index: int, song: FullClassroomSongInfo): void {
        let currentIndex = 0;
        for (let i = 0; i < songs.length; i++) {
            if (songs[i].modification.type !== SongModificationType.DELETED) {
                if (currentIndex === index) {
                    songs[i] = song;
                    break;
                }
                currentIndex++;
            }
        }
    }

    function addSong(song: FullClassroomSongInfo): void {
        songs.push(song);
    }

    function insertSongAt(index: int, song: FullClassroomSongInfo): void {
        let currentIndex = 0;
        for (let i = 0; i < songs.length; i++) {
            if (songs[i].modification.type !== SongModificationType.DELETED) {
                if (currentIndex === index) {
                    songs.splice(i, 0, song);
                    break;
                }
                currentIndex++;
            }
        }
    }

    function removeSongAt(index: int): void {
        let currentIndex = 0;
        for (let i = 0; i < songs.length; i++) {
            if (songs[i].modification.type !== SongModificationType.DELETED) {
                if (currentIndex === index) {
                    songs.splice(i, 1);
                    break;
                }
                currentIndex++;
            }
        }
    }

    playlist.modifications.forEach((mod) => {
        let songCount = getSongCount();
        switch (mod.type) {
            case SongModificationType.ADDED:
                let addMod = <SongAdded>mod;
                if (addMod.index >= songs.length) {
                    addSong({
                        "id": addMod.song.id,
                        "source": addMod.song.source,
                        "title": addMod.song.title,
                        "requested_by": addMod.song.requested_by,
                        "modification": {
                            "song_position": songCount,
                            "playlist_position": int(-1),
                            "type": SongModificationType.ADDED
                        }
                    });
                }
                else if (addMod.index >= 0) {
                    insertSongAt(addMod.index, {
                        "id": addMod.song.id,
                        "source": addMod.song.source,
                        "title": addMod.song.title,
                        "requested_by": addMod.song.requested_by,
                        "modification": {
                            "song_position": songCount,
                            "playlist_position": int(-1),
                            "type": SongModificationType.ADDED
                        }
                    });
                }
                break;
            case SongModificationType.DELETED:
                let deleteMod = <SongDeleted>mod;
                if (deleteMod.index < songCount && deleteMod.index >= 0) {
                    let gottenSong = getSong(deleteMod.index)!;
                    let modification = gottenSong.modification;
                    modification.type = SongModificationType.DELETED;
                    gottenSong.modification = modification;

                    // not required because we just modif the song lmao
                    //setSongAtIndex(deleteMod.index, gottenSong);
                }
                break;
            case SongModificationType.MOVED:
                let movedMod = <SongMoved>mod;
                if ((movedMod.old_index >= songCount || movedMod.old_index < 0) ||
                    (movedMod.new_index >= songCount || movedMod.new_index < 0))
                {
                    break;
                }

                let song = getSong(movedMod.old_index)!;
                let songModification = song.modification;
                songModification.type = SongModificationType.MOVED;
                songModification.song_position = movedMod.new_index;
                song.modification = songModification;

                if (movedMod.new_index + 1 >= songs.length) {
                    addSong(song);
                    removeSongAt(movedMod.old_index);
                }
                else {
                    if (movedMod.new_index < movedMod.old_index) {
                        removeSongAt(movedMod.old_index);
                        insertSongAt(movedMod.new_index, song);
                    }
                    else {
                        insertSongAt(movedMod.new_index, song);
                        removeSongAt(movedMod.old_index);
                    }
                }

                break;
        }
    });

    if (!includeDeletedSongs) {
        songs = songs.filter((song) => song.modification.type !== SongModificationType.DELETED);
    }

    return songs.map(songMapper);
}

function getSongsAsGeneric(playlist: ClassroomPlaylist, playlistSongs: Song[]): GenericClassroomSong[] {
    return getSongsAsBase(playlist, playlistSongs, false, (song) => {
        return {
            "id": song.id,
            "modification": undefined,
            "requested_by": song.requested_by,
            "source": song.source,
            "title": song.title
        };
    });
}

function getSongsAsStudent(playlist: ClassroomPlaylist, playlistSongs: Song[]): SongStudentView[] {
    return getSongsAsBase(playlist, playlistSongs, false, (song) => {
        return {
            "id": song.id,
            "modification": undefined,
            "requested_by": undefined,
            "source": song.source,
            "title": song.title
        };
    });
}

function getSongsAsStudentV2(playlist: ClassroomPlaylistV2, email: string): SongStudentViewV2[] {
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

function getSongsAsTeacher(playlist: ClassroomPlaylist, playlistSongs: Song[]): SongTeacherView[] {
    return getSongsAsBase(playlist, playlistSongs, false, (song) => {
        return {
            "id": song.id,
            "modification": song.modification,
            "requested_by": song.requested_by,
            "source": song.source,
            "title": song.title
        };
    });
}

function getSongsAsTeacherV2(playlist: ClassroomPlaylistV2): SongTeacherViewV2[] {
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

export function getSongsAsClassSongsV2(playlist: ClassroomPlaylistV2, role: Role, email: string): ClassroomSongV2[] {
    console.log(role);
    switch (role) {
        case Role.Teacher:
            console.log("I am teacher. I should do teacher stuff");
            return getSongsAsTeacherV2(playlist);
        case Role.Student:
            return getSongsAsStudentV2(playlist, email);
    }

    return [];
}

export async function getSongsAsClassSongs(playlist: ClassroomPlaylist, playlistDB: PlaylistDataBase, classroomOwnerEmail: string, role: Role): Promise<ClassroomSong[]> {
    let playlistSongs: Song[] = await getSongs(playlist, playlistDB, classroomOwnerEmail);

    switch (role) {
        case Role.Teacher:
            return getSongsAsTeacher(playlist, playlistSongs);
        case Role.Student:
            return getSongsAsStudent(playlist, playlistSongs);
    }

    return [];
}

export async function getSongs(playlist: ClassroomPlaylist, playlistDB: PlaylistDataBase, classroomOwnerEmail: string): Promise<Song[]> {
    if (playlist.playlist == null) {
        return [];
    }

    let email = playlist.playlist.owner;
    let id = playlist.playlist.id;

    return await playlistDB.getSongsAsUser(classroomOwnerEmail, email, id);
}

export async function addSong(playlist: ClassroomPlaylist, playlistDB: PlaylistDataBase, classroomOwnerEmail: string, song: SongToAdd, index: int, role: Role): Promise<ClassroomSong[]> {
    let playlistSongs = await getSongs(playlist, playlistDB, classroomOwnerEmail);
    for (let index = 0; index < playlistSongs.length; index++) {
        // already exists
        if (playlistSongs[index].id == song.id && playlistSongs[index].source === song.source) {
            throw new Error("Song already exists!");
        }
    }
    if (index === -1) {
        let songCount = playlistSongs.length;
        for (let i = 0; i < playlist.modifications.length; i++) {
            switch (playlist.modifications[i].type) {
                case SongModificationType.ADDED:
                    songCount++;
                    break;
                case SongModificationType.DELETED:
                    songCount--;
                    break;
            }
        } 

        index = int(songCount);
    }

    let addMod: SongAdded = {
        "index": index,
        "type": SongModificationType.ADDED,
        "song": song
    };
    playlist.modifications.push(addMod);

    let songs = getSongsAsGeneric(playlist, playlistSongs);
    playlist.modifications = generateModifications(playlistSongs, songs);

    switch (role) {
        case Role.Teacher:
            return getSongsAsTeacher(playlist, playlistSongs);
        case Role.Student:
            return getSongsAsStudent(playlist, playlistSongs);
    }

    return [];
}

export function deleteSongV2(playlist: ClassroomPlaylistV2, index: int): void {
    let song = playlist.songs[index];
    if (song == null) return console.warn("Song is not exist! This is not okay! Index: " + index);

    for (let i = 0; i < playlist.priority.length; i++) {
        if (playlist.priority[i].id === song.id && playlist.priority[i].source === song.source) {
            playlist.priority.splice(i, 1);
            return;
        }
    }

    playlist.songs.splice(index, 1);

    if (playlist.currentSong.index === index) {
        
        // todo: migrate to another methoed because this is literally the code
        //       for the next song
        if (playlist.currentSong.fromPriority) {
            playlist.priority.splice(0, 1);

            if (playlist.priority.length > 0) {
                let prioritySong = playlist.priority[0];
                playlist.currentSong = {
                    "fromPriority": true,
                    "index": int(playlist.songs.findIndex((song) => {
                        return song.id == prioritySong.id && song.source == prioritySong.source;
                    }))
                };
            }
            else if (playlist.currentSong.index > -1) {
                playlist.currentSong = {
                    "fromPriority": false,
                    "index": int((playlist.currentSong.index + 1) % playlist.songs.length)
                };
            }
        }
        else {
            playlist.currentSong = {
                "fromPriority": false,
                "index": int((playlist.currentSong.index + 1) % playlist.songs.length)
            };
        }
    }
}

export async function deleteSong(playlist: ClassroomPlaylist, playlistDB: PlaylistDataBase, classroomOwnerEmail: string, index: int): Promise<ClassroomSong[]> {
    console.log("Deleting a song! Wow!");
    if (playlist.currentSongPosition >= index) {
        playlist.currentSongPosition--;
    }
    let deleteMod: SongDeleted = {
        "index": index,
        "type": SongModificationType.DELETED
    };
    console.log(playlist.modifications);
    playlist.modifications.push(deleteMod);

    let playlistSongs = await getSongs(playlist, playlistDB, classroomOwnerEmail);
    let songs = getSongsAsGeneric(playlist, playlistSongs);

    playlist.modifications = generateModifications(playlistSongs, songs);
    console.log(playlist.modifications);

    let newSongs = getSongsAsTeacher(playlist, playlistSongs);
    if (playlist.currentSongPosition >= newSongs.length) {
        playlist.currentSongPosition = int(0);
    }
    else if (playlist.currentSongPosition < 0) {
        playlist.currentSongPosition = int(Math.max(newSongs.length - 1, 0));
    }
    return newSongs;
}

export async function moveSong(playlist: ClassroomPlaylist, playlistDB: PlaylistDataBase, classroomOwnerEmail: string, oldIndex: int, newIndex: int): Promise<ClassroomSong[]> {
    let movedMod: SongMoved = {
        "old_index": oldIndex,
        "new_index": newIndex,
        "type": SongModificationType.MOVED
    };
    playlist.modifications.push(movedMod);

    let playlistSongs = await getSongs(playlist, playlistDB, classroomOwnerEmail);
    let songs = getSongsAsGeneric(playlist, playlistSongs);

    playlist.modifications = generateModifications(playlistSongs, songs);

    return getSongsAsTeacher(playlist, playlistSongs);
}

export async function shuffleSongs(playlist: ClassroomPlaylist, playlistDB: PlaylistDataBase, classroomOwnerEmail: string): Promise<ClassroomSong[]> {
    
    let playlistSongs = await getSongs(playlist, playlistDB, classroomOwnerEmail);
    let songs = getSongsAsGeneric(playlist, playlistSongs);

    let random = seedrandom();
    let newSongs: GenericClassroomSong[] = [...songs];
    for (let offset = 0, length = newSongs.length; offset < length; offset++) {
        let randomIndex = Math.floor(random() * (length - offset));
        let newSong = newSongs[randomIndex];

        newSongs.splice(randomIndex, 1);
        newSongs.push(newSong);
    }

    playlist.modifications = generateModifications(playlistSongs, newSongs);
    
    return getSongsAsTeacher(playlist, playlistSongs);
}

export function shuffleSongsV2(playlist: ClassroomPlaylistV2): void {
    let indexMap: number[] = [];
    let random = seedrandom();
    for (let i = 0; i < playlist.songs.length; i++) {
        indexMap.push(i);
    }

    for (let i = 0; i < indexMap.length; i++) {
        let randomIndex = Math.floor(random() * (indexMap.length - i));
        indexMap.push(...indexMap.splice(indexMap[randomIndex], 1));
    }

    console.log("index map:");
    console.log(indexMap);

    playlist.currentSong.index = int(indexMap[playlist.currentSong.index]);
    let newSongs: ClassroomPlaylistSongV2[] = [];
    for (let i = 0; i < indexMap.length; i++) {
        newSongs.push(playlist.songs[indexMap[i]])
    }
    playlist.songs = newSongs;
}
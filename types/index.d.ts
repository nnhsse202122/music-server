
declare namespace SongServer.Data {
    type Classroom = {
        /** The class name */
        name: string,
        /** The class code */
        code: string,
        /** The teacher that manages this classroom */
        teacher: string,
        /** The list of students by email */
        students: string[],
        /** Classroom settings */
        settings: ClassroomSettings,
        /** The playlist this classroom is using */
        playlist: ClassroomPlaylist | null
    }

    type ClassroomSettings = {
        allowSongSubmission: boolean,
        joinable: boolean
    };

    // container for holding info for classes for a teacher/student
    type UserBase<TType extends string> = {
        /** The type of user */
        type: TType,
        /** The name of the user */
        name: string,
        /** The user email */
        email: string,
        /** The list of classrooms by ID. */
        classrooms: UserClass[],
        /** The current classroom. */
        currentClass: string | null
    };

    type UserClass = {
        code: string,
    }

    type TeacherUser = UserBase<"teacher">;
    type StudentUser = UserBase<"student">;

    type User = TeacherUser | StudentUser;

    /**
     * Representation of a session
     */
    type Session = {
        /** The email the session is for */
        email: string,
        /** The name of the user the session is for */
        name: string,
        /** The access token of the session */
        accessToken: string,
        /** The UTC timestamp at which the session expires at. */
        expiresAfter: number
    };

    /**
     * Information of a classroom playlist
     */
    type ClassroomPlaylist = {
        /** The ID of the playlist () */
        playlistID: string,
        /** The owner of the playlist */
        playlistOwner: string,
        /** Current playlist song position */
        songPosition: number,
        /** Song Overrides */
        overrides: ClassroomPlaylistSongOverride[]
    };

    /** Information for the classroom playlist song overrides */
    type ClassroomPlaylistSongOverride = {
        type: "move",
        index: number,
        newIndex: number
    } | {
        type: "add",
        index: number,
        song: ClassroomPlaylistSong
    } | {
        type: "remove",
        index: number
    }

    type UserPlaylistsInfo = {
        email: string,
        playlists: {
            [key: string]: Playlist | undefined
        }
    }

    type Playlist = {
        /** The name of the playlist */
        name: string,
        /** The visibility of the playlist */
        visibility: PlaylistVisibility,
        /** The songs inside the playlist */
        songs: PlaylistSong[]
    }

    type PlaylistVisibility = "public" | "unlisted" | "private";

    type SongBase = YoutubeSong | UnknownSong;
    type PlaylistSong = SongBase;
    type Song = {
        /** The user that requested the song */
        requestedBy: SongServer.API.BasicUser
    } & SongBase;

    type ClassroomPlaylistSong = {
        /** The user that requested the song */
        requestedBy?: SongServer.API.BasicUser
    } & (Song | PlaylistSong)

    type UnknownSong = {
        source: "unknown"
    }

    type YoutubeSong = {
        source: "youtube",
        videoID: string
    }
}

declare namespace SongServer.API {
    type ClassroomSettingsInfo = {
        allowSongSubmission: boolean,
        joinable: boolean
    };

    type UserInfoBase<TType extends string> = {
        type: TType;
        name: string;
        email: string,
    }

    type TeacherInfo = UserInfoBase<"teacher">;
    type StudentInfo = UserInfoBase<"student"> & {
        currentClass: string | null
    };

    type UserInfo = TeacherInfo | StudentInfo;
    type UserType = ClassroomRole;

    type ClassroomRole = "student" | "teacher"

    type ClassroomInfoBase<TRole extends ClassroomRole> = {
        role: TRole,
        name: string,
        code: string,
    }

    type StudentClassroomInfo = ClassroomInfoBase<"student"> & {
        playlist: ClassroomStudentSongInfo[] | null
    }
    type TeacherClassroomInfo = ClassroomInfoBase<"teacher"> & {
        students: StudentInClassroom[],
        playlist: ClassroomTeacherSongInfo[] | null
    }

    type ClassroomInfo = StudentClassroomInfo | TeacherClassroomInfo;

    type PlaylistInfo = {
        id: string,
        songs: SongInfo[]
    }

    type SongInfo = {
        id: string,
        source: SongSource,
        requested_by?: BasicUser,
        is_temp: boolean
    }

    type BasicUser = {
        name: string,
        email: string
    }

    type StudentInClassroom = {
        name: string;
        email: string,
    }

    // type containing information of a fetched video using the search
    // option for the youtube api, or for a singular video
    type FetchedVideo = {
        /** The title of the video */
        title: string,
        /** The video id */
        id: string
    }

    type CreatedSessionInfo = {
        // The UTC timestamp at which this session expires
        expires_at: number,
        // The generated session token.
        token: string
    }

    type CreatedClassroomInfo = {
        /** The class name */
        name: string,
        /** The class code */
        code: string,
        /** The teacher that manages this classroom */
        teacher: string,
        /** The list of students by email */
        students: string[],
        /** Classroom settings */
        settings: ClassroomSettingsInfo,
        /** playlist */
        playlist: null | ClassroomSongInfo[]
    }

    type CreatedPlaylistInfo = {
        id: string,
        owner: string
    }

    type ClassroomSongBase = {
        id: string,
        source: SongSource
    } | {
        id: null,
        source: "unknown"
    };

    type ClassroomTeacherSongInfo = ClassroomSongBase & {
        requested_by: BasicUser | null,
        is_temp: boolean
    }

    type ClassroomStudentSongInfo = ClassroomSongBase;

    type ClassroomSongInfo = ClassroomTeacherSongInfo | ClassroomStudentSongInfo;
    type ClassroomPlaylistInfo = {
        name: string,
        songs: ClassroomSongInfo[]
    };

    type SongSource = "youtube";
}

declare namespace SongServer.API.Responses {
    type SuccessAPIResponse<TData> = {
        data: TData,
        success: true;
    }

    type FailAPIResponse = {
        message: string,
        success: false;
    }
    type APIResponse<TData> = SuccessAPIResponse<TData> | FailAPIResponse;

    type DeleteResponse = APIResponse<boolean>;

    type FetchVideoAPIResponse = APIResponse<FetchedVideo>;
    type SearchVideosAPIResponse = APIResponse<FetchedVideo[]>;

    type ClassroomsAPIResponse = APIResponse<ClassroomInfo[]>;
    type CreateClassroomAPIResponse = APIResponse<CreatedClassroomInfo>;
    type ClassroomAPIResponse = APIResponse<ClassroomInfo>;
    type ClassroomSettingsAPIResponse = APIResponse<ClassroomSettingsInfo>;
    type ClassroomModifySettingsAPIResponse = APIResponse<boolean>;
    type ClassroomModifyAPIResponse = APIResponse<boolean>;
    type ClassroomJoinAPIResponse = APIResponse<boolean>;

    type ClassroomStudentAPIResponse = APIResponse<StudentInfo>;
    type ClassroomStudentsAPIResponse = APIResponse<StudentInfo[]>;
    type ClassroomAddStudentAPIResponse = APIResponse<boolean>;
    type ClassroomRemoveStudentAPIResponse = DeleteResponse;

    type ClassroomPlaylistAPIResponse = APIResponse<ClassroomPlaylistInfo>;
    type ClassroomNewPlaylistAPIResponse = APIResponse<ClassroomPlaylistInfo>;
    type ClassroomDeletePlaylistAPIResponse = DeleteResponse;
    type ClassroomAddSongAPIResponse = APIResponse<boolean>;
    type ClassroomMoveSongAPIResponse = APIResponse<boolean>;
    type ClassroomRemoveSongAPIResponse = DeleteResponse;
    type ClassroomShufflePlaylistAPIResponse = APIResponse<ClassroomPlaylistInfo>;

    type DeletePlaylistResponse = DeleteResponse;
    type DeleteSongFromPlaylistResponse = DeleteResponse;
    type PlaylistInfoResponse = APIResponse<PlaylistInfo>;
    type AddSongToPlaylistResponse = APIResponse<boolean>;
    type CreatePlaylistResponse = APIResponse<CreatedPlaylistInfo>;

    type FetchUserResponse = APIResponse<UserInfo>;

    type AuthorizeResponse = APIResponse<CreatedSessionInfo>
}

declare namespace SongServer.API.Server.Requests {
    type PatchClassroomRequest = {
        name?: any
    }

    type PatchClassroomSettingsRequest = {
        allowSongSubmission?: any,
        joinable?: any
    }

    type CreateClassroomRequest = {
        name?: any,
        joinable?: any,
        allowSongSubmissions?: any
    };

    type AddSongToPlaylistRequest = {
        source?: any,
        id?: any
    }

    type AuthorizeRequest = {
        token?: any
    }

    type SetPlaylistRequest = {
        playlistAuthor?: any,
        playlistID?: any
    };

    type AddSongToClassroomPlaylistRequest = {
        source?: any,
        songID?: any
    }

    type RemoveSongToClassroomPlaylistRequest = {
        source?: any,
        songID?: any
    }

    type ModifySongInClassroomPlaylistRequest = {
        source?: any,
        songID?: any,
        newPosition?: any
    }

    type CreatePlaylistRequest = {
        name?: any,
        playlistVisibility?: any
    }
}

declare namespace SongServer.API.Client.Requests {
    type PatchClassroomRequest = {
        name?: string
    }

    type PatchClassroomSettingsRequest = {
        allowSongSubmission?: boolean,
        joinable?: boolean
    }

    type CreateClassroomRequest = {
        name?: string,
        joinable?: boolean,
        allowSongSubmissions?: boolean
    };

    type AddSongToPlaylistRequest = {
        source?: "youtube",
        id?: string
    }

    type AuthorizeRequest = {
        token?: string
    }

    type SetPlaylistRequest = {
        playlistAuthor?: string,
        playlistID?: string
    };

    type AddSongToClassroomPlaylistRequest = {
        source?: string,
        songID?: string
    }

    type RemoveSongToClassroomPlaylistRequest = {
        source?: string,
        songID?: string
    }

    type ModifySongInClassroomPlaylistRequest = {
        source?: string,
        songID?: string,
        newPosition?: number
    }

    type CreatePlaylistRequest = {
        name?: string,
        playlistVisibility?: SongServer.Data.PlaylistVisibility
    }
}
declare namespace SongServer.API.Data {
    export enum SongSource {
        youtube = "youtube"
    }

    export type BasicUser = {
        name: string,
        email: string
    };

    export type SongTeacherView = ClassroomSong & {
        requested_by: BasicUser,
        from_priority: boolean,
        is_liked: undefined,
        likes: number
    };

    export type ClassroomSong = BasicSong & {
        requested_by: BasicUser | undefined,
        from_priority: boolean | undefined,
        position: number,
        likes: number | undefined,
        is_liked: boolean | undefined
    }

    export type BasicSong = {
        id: string,
        title: string,
        source: SongSource
    };

    export type GottenClassroom = GottenClassroomAsOutsider | GottenClassroomAsStudent | GottenClassroomAsTeacher;

    export type GottenClassroomAsOutsider = {
        name: string,
        code: string,
        settings: BasicClassroomSettings
    };

    export type GottenClassroomAsStudent = {
        name: string,
        code: string,
        settings: BasicClassroomSettings,
        tokens: number
    };

    export type BasicClassroomSettings = {
        allow_submissions: boolean,
        submissions_require_tokens: boolean,
        joinable: boolean,
        playlist_visible: boolean
    };

    export type GottenClassroomAsTeacher = {
        name: string,
        code: string,
        settings: BasicClassroomSettings,
        students: StudentInClass[]
    }

    export type StudentInClass = {
        name: string,
        email: string,
        tokens: number,
        likes: number,
    };

    export type JoinedClassroom = {
        name: string,
        code: string,
        tokens: number
    };

    export enum Role {
        Teacher = 0,
        Student = 1
    }

    export type FetchedNonLocalUser = {
        email: string,
        name: string,
        profile_url: string,
        role: Role
    };

    export type FetchedLocalUser = {
        name: string,
        email: string,
        profile_url: string,
        role: Role,
        classrooms: string[],
        playlists: string[]
    };

    export type YoutubeVideo = {
        title: string,
        author: string,
        id: string,
        thumbnail: string | null,
        duration: string
    };
}

declare namespace SongServer.API.Requests {
    export type AuthorizeRequest = {
        token: string
    }

    export type SetStudentTokensRequest = {
        tokens: number
    };

    export type SetClassroomSettingsRequest = {
        name: string,
        allowSongSubmissions: boolean,
        submissionsRequireTokens: boolean,
        joinable: boolean,
        playlistVisible: boolean,
        likesEnabled: boolean,
        priorityEnabled: boolean,
        priorityCost: number,
        likesVisible: boolean
    };

    export type UpdateClassroomSettingsRequest = Partial<SetClassroomSettingsRequest>;

    export type RemoveClassroomSongRequest = {
        index: number
    };

    export type AddClassroomSongRequest = {
        id: string,
        source: Data.SongSource
    };

    export type CreateClassroomRequest = {
        name: string,
        joinable?: boolean,
        allowSongSubmissions?: boolean,
        submissionsRequireTokens?: boolean,
        playlistVisible?: boolean
    };

    export type SetCurrentSongRequest = {
        index: number
    };
}

declare namespace SongServer.API.Responses {
    export type AuthorizeResponse = {
        expires_at: number,
        token: string
    };

    export type ClassroomPlaylistResponse = {
        songs: Data.SongTeacherView[],
        currentSong: Data.SongTeacherView | null,
    }

    export type CreatedClassroomResponse = {
        name: string,
        code: string
    };

    export type ClassroomSettingsResponse = {
        name: string,
        allowSongSubmissions: boolean,
        submissionsRequireTokens: boolean,
        joinable: boolean,
        playlistVisible: boolean,
        likesEnabled: boolean,
        likesVisible: boolean,
        priorityEnabled: boolean,
        priorityCost: number
    };
}

declare namespace SongServer.API {

    export type FailAPIResponse = {
        success: false,
        status: number,
        id: string,
        parameters: Record<string, string>,
        message: string
    };
    export type SuccessAPIResponse<TData> = {
        success: true,
        data: TData
    };
    
    export type APIResponse<TData> = FailAPIResponse | SuccessAPIResponse<TData>;
    export type PendingAPIResponse<TData> = Promise<APIResponse<TData>>;
    export type APIRequestHandler<TData> = () => PendingAPIResponse<TData>;
    export type AuthorizedAPIRequestHandler<TData> = (auth?: string | null) => PendingAPIResponse<TData>;
    export type APIRequestHandlerWithBody<TBody, TData> = (body: TBody) => PendingAPIResponse<TData>;
    export type AuthorizedAPIRequestHandlerWithBody<TBody, TData> = (body: TBody, auth?: string | null) => PendingAPIResponse<TData>;
    
    export type SongServerAPIEndpoints = {
        authorization: AuthorizeEndpoint,
        classrooms: ClassroomsEndpoint,
        users: UsersEndpoint,
        beans: BeansEndpoint,
        youtube: YoutubeEndpoint
    };
    
    export type YoutubeEndpoint = {
        search: AuthorizedAPIRequestHandlerWithBody<string, Data.YoutubeVideo[]>,
        fetch: AuthorizedAPIRequestHandlerWithBody<string, Data.YoutubeVideo>
    }

    export type AuthorizeEndpoint = {
        auth: APIRequestHandlerWithBody<Requests.AuthorizeRequest, Responses.AuthorizeResponse>,
    }
    
    export type ClassroomsEndpoint = {
        find(code: string): ClassroomEndpoint,
        list: AuthorizedAPIRequestHandler<Data.GottenClassroom[]>,
        create: AuthorizedAPIRequestHandlerWithBody<Requests.CreateClassroomRequest, Responses.CreatedClassroomResponse>
    }
    
    export type ClassroomEndpoint = {
        students: StudentsEndpoint,
        settings: ClassroomSettingsEndpoint,
        playlist: ClassroomPlaylistEndpoint,
        get: AuthorizedAPIRequestHandler<Data.GottenClassroom>,
        delete: AuthorizedAPIRequestHandler<boolean>
    }
    
    export type BeansEndpoint = {
        get: APIRequestHandler<string>,
        set: APIRequestHandlerWithBody<any, void>
    }
    
    export type StudentsEndpoint = {
        find: (email: string) => StudentEndpoint, 
        join: AuthorizedAPIRequestHandler<Data.JoinedClassroom>,
        list: AuthorizedAPIRequestHandler<Data.StudentInClass[]>,
        removeAll: AuthorizedAPIRequestHandler<boolean>
    }
    
    export type StudentEndpoint = {
        tokens: StudentTokensEndpoint,
        likes: StudentTokensEndpoint,
        remove: AuthorizedAPIRequestHandler<boolean>
    }
    
    export type StudentTokensEndpoint = {
        get: AuthorizedAPIRequestHandler<number>,
        set: AuthorizedAPIRequestHandlerWithBody<number, number>
    }
    
    export type StudentLikesEndpoint = {
        get: AuthorizedAPIRequestHandler<number>,
        set: AuthorizedAPIRequestHandlerWithBody<number, number>
    }
    
    export type ClassroomSettingsEndpoint = {
        get: AuthorizedAPIRequestHandler<Responses.ClassroomSettingsResponse>,
        set: AuthorizedAPIRequestHandlerWithBody<Requests.SetClassroomSettingsRequest, Responses.ClassroomSettingsResponse>,
        update: AuthorizedAPIRequestHandlerWithBody<Requests.UpdateClassroomSettingsRequest, Responses.ClassroomSettingsResponse>,
    };
    
    export type ClassroomPlaylistEndpoint = {
        songs: ClassroomPlaylistSongsEndpoint,
        nextSong: AuthorizedAPIRequestHandler<Data.ClassroomSong>,
        previousSong: AuthorizedAPIRequestHandler<Data.ClassroomSong>,
        shuffle: AuthorizedAPIRequestHandler<Data.ClassroomSong[]>,
    };

    export type ClassroomPlaylistSongsEndpoint = {
        add: AuthorizedAPIRequestHandlerWithBody<Requests.AddClassroomSongRequest, Data.ClassroomSong[]>,
        currentSong: ClassroomPlaylistCurrentSongEndpoint,
        find: (index: number) => ClassroomPlaylistSongEndpoint,
        list: AuthorizedAPIRequestHandler<Data.ClassroomSong[]>,
    }

    export type ClassroomPlaylistSongEndpoint = {
        like: AuthorizedAPIRequestHandler<boolean>,
        prioritize: AuthorizedAPIRequestHandler<number>,
        delete: AuthorizedAPIRequestHandler<{
            songs: Data.ClassroomSong[]
        }>,
    }
    
    export type ClassroomPlaylistCurrentSongEndpoint = {
        get: AuthorizedAPIRequestHandler<Data.ClassroomSong>,
        set: AuthorizedAPIRequestHandlerWithBody<number, Data.ClassroomSong>,
    };
    
    export type UsersEndpoint = {
        find: (email: string) => UserEndpoint<Data.FetchedNonLocalUser>,
        me: () => UserEndpoint<Data.FetchedLocalUser>
    };
    
    export type UserEndpoint<TUser> = {
        get: AuthorizedAPIRequestHandler<TUser>
    };
}
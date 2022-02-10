import AuthorizeRequest from "../api/requests/AuthorizeRequest";
import AuthorizeResponse from "../api/responses/AuthorizeResponse";
import { i32 as int } from "typed-numbers";
import fetch from "node-fetch";
import SetStudentTokensRequest from "../api/requests/SetStudentTokensRequest";
import JoinedClassroom from "../data/classrooms/JoinedClassroom";
import StudentInClass from "../data/classrooms/StudentInClass";
import ClassroomSettingsResponse from "../api/responses/ClassroomSettingsResponse";
import SetClassroomSettingsRequest from "../api/requests/SetClassroomSettingsRequest";
import UpdateClassroomSettingsRequest from "../api/requests/UpdateClassroomSettingsRequest";
import ClassroomPlaylistResponse from "../api/responses/ClassroomPlaylistResponse";
import ClassroomSong from "../data/classrooms/ClassroomSong";
import RemoveClassroomSongRequest from "../api/requests/RemoveClassroomSongRequest";
import AddClassroomSongRequest from "../api/requests/AddClassroomSongRequest";
import MoveClassroomSongRequest from "../api/requests/MoveClassroomSongRequest";
import SetClassroomSongPositionRequest from "../api/requests/SetClassroomSongPositionRequest";
// @ts-ignore
import config from "../../config.json";
import FetchedLocalUser from "../data/playlists/FetchedLocalUser";
import FetchedNonLocalUser from "../data/playlists/FetchedNonLocalUser";
import FetchedUser from "../data/playlists/FetchedUser";
import GottenClassroom from "../api/responses/GottenClassroom";
import CreateClassroomRequest from "../api/requests/CreateClassroomRequest";
import CreatedClassroomResponse from "../api/responses/CreatedClassroomResponse";

type FailAPIResponse = {
    success: false,
    code: number,
    message: string
};
type SuccessAPIResponse<TData> = {
    success: true,
    data: TData
};

type APIResponse<TData> = FailAPIResponse | SuccessAPIResponse<TData>;
type PendingAPIResponse<TData> = Promise<APIResponse<TData>>;
type APIRequestHandler<TData> = () => PendingAPIResponse<TData>;
type AuthorizedAPIRequestHandler<TData> = (auth: string) => PendingAPIResponse<TData>;
type APIRequestHandlerWithBody<TBody, TData> = (body: TBody) => PendingAPIResponse<TData>;
type AuthorizedAPIRequestHandlerWithBody<TBody, TData> = (body: TBody, auth: string) => PendingAPIResponse<TData>;

type SongServerAPIEndpoints = {
    authorization: AuthorizeEndpoint,
    classrooms: ClassroomsEndpoint,
    users: UsersEndpoint
};

type AuthorizeEndpoint = {
    auth: APIRequestHandlerWithBody<AuthorizeRequest, AuthorizeResponse>,
}

type ClassroomsEndpoint = {
    find(code: string): ClassroomEndpoint,
    list: AuthorizedAPIRequestHandler<GottenClassroom[]>,
    create: AuthorizedAPIRequestHandlerWithBody<CreateClassroomRequest, CreatedClassroomResponse>
}

type ClassroomEndpoint = {
    students: StudentsEndpoint,
    settings: ClassroomSettingsEndpoint,
    playlist: ClassroomPlaylistEndpoint,
    get: AuthorizedAPIRequestHandler<GottenClassroom>,
    delete: AuthorizedAPIRequestHandler<boolean>
}

type StudentsEndpoint = {
    find: (email: string) => StudentEndpoint, 
    join: AuthorizedAPIRequestHandler<JoinedClassroom>,
    list: AuthorizedAPIRequestHandler<StudentInClass[]>,
    removeAll: AuthorizedAPIRequestHandler<boolean>
}

type StudentEndpoint = {
    tokens: StudentTokensEndpoint,
    remove: AuthorizedAPIRequestHandler<boolean>
}

type StudentTokensEndpoint = {
    get: AuthorizedAPIRequestHandler<int>,
    set: AuthorizedAPIRequestHandlerWithBody<SetStudentTokensRequest, int>
}

type ClassroomSettingsEndpoint = {
    get: AuthorizedAPIRequestHandler<ClassroomSettingsResponse>,
    set: AuthorizedAPIRequestHandlerWithBody<SetClassroomSettingsRequest, ClassroomSettingsResponse>,
    update: AuthorizedAPIRequestHandlerWithBody<UpdateClassroomSettingsRequest, ClassroomSettingsResponse>,
};

type ClassroomPlaylistEndpoint = {
    get: AuthorizedAPIRequestHandler<ClassroomPlaylistResponse>,
    position: ClassroomPlaylistPositionEndpoint,
    shuffle: AuthorizedAPIRequestHandler<ClassroomSong[]>,
    songs: ClassroomPlaylistSongsEndpoint
};

type ClassroomPlaylistPositionEndpoint = {
    get: AuthorizedAPIRequestHandler<int>,
    set: AuthorizedAPIRequestHandlerWithBody<SetClassroomSongPositionRequest, int>
};

type ClassroomPlaylistSongsEndpoint = {
    get: AuthorizedAPIRequestHandler<ClassroomSong[]>,
    move: AuthorizedAPIRequestHandlerWithBody<MoveClassroomSongRequest, ClassroomSong[]>,
    add: AuthorizedAPIRequestHandlerWithBody<AddClassroomSongRequest, ClassroomSong[]>,
    delete: AuthorizedAPIRequestHandlerWithBody<RemoveClassroomSongRequest, ClassroomSong[]>,
};

type UsersEndpoint = {
    find: (email: string) => UserEndpoint<FetchedNonLocalUser>,
    me: () => UserEndpoint<FetchedLocalUser>
}

type UserEndpoint<TUser> = {
    get: AuthorizedAPIRequestHandler<TUser>
};

const SongServerAPI = (apiVersion: int = int(1)): SongServerAPIEndpoints => { 

    async function handleReq<TData, TBody = any>(path: string, method: string, authorization: string | undefined, body: TBody | undefined = undefined): PendingAPIResponse<TData> {
        if (path.startsWith("/")) path = path.substring(1);
        let hasBody = body !== undefined;

        let req = await fetch(`http://${config.api.domain}:${config.api.port}/api/v${apiVersion}/${path}`, {
            "method": method,
            // @ts-ignore
            "headers": {
                // @ts-ignore
                "Content-Type": hasBody ? "application/json" : undefined,
                // @ts-ignore
                "Authorization": authorization
            },
            "body": hasBody ? JSON.stringify(body) : undefined
        });
        return await req.json() as APIResponse<TData>;
    }

    function userAPI(): UserEndpoint<FetchedLocalUser>
    function userAPI(email: string): UserEndpoint<FetchedNonLocalUser>;
    function userAPI(email: string = "@me"): UserEndpoint<FetchedUser> {
        return {
            "get": async (auth: string): PendingAPIResponse<FetchedUser> => {
                return await handleReq(`/users/${email}/`, "GET", auth);
            }
        }
    }

    return {
        "authorization": {
            "auth": async (body: AuthorizeRequest): PendingAPIResponse<AuthorizeResponse> => {
                return await handleReq("/authorize", "POST", undefined, body);
            }
        },
        "classrooms": {
            "find": (code: string) => {
                return {
                    "get": async (auth: string): PendingAPIResponse<GottenClassroom> => {
                        return await handleReq(`/classrooms/${code}`, "GET", auth);
                    },
                    "delete": async (auth: string): PendingAPIResponse<boolean> => {
                        return await handleReq(`/classrooms/${code}`, "DELETE", auth);
                    },
                    "students": {
                        "find": (email: string) => {
                            return {
                                "remove": async (auth: string): PendingAPIResponse<boolean> => {
                                    return await handleReq(`/classrooms/${code}/students/${email}`, "DELETE", auth);
                                },
                                "tokens": {
                                    "get": async (auth: string): PendingAPIResponse<int> => {
                                        return await handleReq(`/classrooms/${code}/students/${email}/tokens`, "GET", auth);
                                    },
                                    "set": async (body: SetStudentTokensRequest, auth: string): PendingAPIResponse<int> => {
                                        return await handleReq(`/classrooms/${code}/students/${email}/tokens`, "POST", auth, body);
                                    }
                                }
                            }
                        },
                        "join": async (auth: string): PendingAPIResponse<JoinedClassroom> => {
                            return await handleReq(`/classrooms/${code}/students`, "POST", auth);
                        },
                        "list": async (auth: string): PendingAPIResponse<StudentInClass[]> => {
                            return await handleReq(`/classrooms/${code}/students`, "GET", auth);
                        },
                        "removeAll": async (auth: string): PendingAPIResponse<boolean> => {
                            return await handleReq(`/classrooms/${code}/students`, "DELETE", auth);
                        }
                    },
                    "settings": {
                        "get": async (auth: string): PendingAPIResponse<ClassroomSettingsResponse> => {
                            return await handleReq(`/classrooms/${code}/settings`, "GET", auth);
                        },
                        "set": async (body: SetClassroomSettingsRequest, auth: string): PendingAPIResponse<ClassroomSettingsResponse> => {
                            return await handleReq(`/classrooms/${code}/settings`, "POST", auth, body);
                        },
                        "update": async (body: UpdateClassroomSettingsRequest, auth: string): PendingAPIResponse<ClassroomSettingsResponse> => {
                            return await handleReq(`/classrooms/${code}/settings`, "PATCH", auth, body);
                        }
                    },
                    "playlist": {
                        "get": async (auth: string): PendingAPIResponse<ClassroomPlaylistResponse> => {
                            return await handleReq(`/classrooms/${code}/playlist`, "GET", auth);
                        },
                        "position": {
                            "get": async (auth: string): PendingAPIResponse<int> => {
                                return await handleReq(`/classrooms/${code}/playlist/position`, "GET", auth);
                            },
                            "set": async (body: SetClassroomSongPositionRequest, auth: string): PendingAPIResponse<int> => {
                                return await handleReq(`/classrooms/${code}/playlist/position`, "POST", auth, body);
                            }
                        },
                        "shuffle": async (auth: string): PendingAPIResponse<ClassroomSong[]> => {
                            return await handleReq(`/classrooms/${code}/playlist/shuffle`, "POST", auth);
                        },
                        "songs": {
                            "get": async (auth: string): PendingAPIResponse<ClassroomSong[]> => {
                                return await handleReq(`/classrooms/${code}/playlist/songs`, "GET", auth);
                            },
                            "add": async (body: AddClassroomSongRequest, auth: string): PendingAPIResponse<ClassroomSong[]> => {
                                return await handleReq(`/classrooms/${code}/playlist/songs`, "POST", auth, body);
                            },
                            "move": async (body: MoveClassroomSongRequest, auth: string): PendingAPIResponse<ClassroomSong[]> => {
                                return await handleReq(`/classrooms/${code}/playlist/songs`, "PUT", auth, body);
                            },
                            "delete": async (body: RemoveClassroomSongRequest, auth: string): PendingAPIResponse<ClassroomSong[]> => {
                                return await handleReq(`/classrooms/${code}/playlist/songs`, "DELETE", auth, body);
                            }
                        }
                    }
                }
            },
            "create": async (body: CreateClassroomRequest, auth: string): PendingAPIResponse<CreatedClassroomResponse> => {
                return await handleReq(`/classrooms`, "POST", auth, body);
            },
            "list": async (auth: string): PendingAPIResponse<GottenClassroom[]> => {
                return await handleReq(`/classrooms`, "GET", auth);
            }
        },
        "users": {
            "find": (email: string) => {
                return userAPI(email);
            },
            "me": () => {
                return userAPI();
            }
        }
    };
}

export default SongServerAPI;
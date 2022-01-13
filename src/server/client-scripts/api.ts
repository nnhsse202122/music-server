/// <reference lib="dom" />
function ClientAPI(version: number = 1) {
    async function doReq<T>(url: string, method: string, headers?: {
        [x: string]: string
    }, body?: any) {
        let response = await fetch(url, {
            "method": method,
            "headers": headers,
            "body": body
        });

        let result: T = await response.json();
        return result;
    }

    async function get<T>(path: string, headers?: {
        [x: string]: string
    }, body?: any, apiVer?: number): Promise<T> {
        if (apiVer === undefined) apiVer = version;
        if (path.startsWith('/')) path = path.substring(1);
        let url = `/api/v${apiVer}/${path}`;

        return await doReq<T>(url, "GET", headers, body);
    }

    async function post<T>(path: string, headers?: {
        [x: string]: string
    }, body?: any, apiVer?: number): Promise<T> {
        if (apiVer === undefined) apiVer = version;
        if (path.startsWith('/')) path = path.substring(1);
        let url = `/api/v${apiVer}/${path}`;

        return await doReq<T>(url, "POST", headers, body);
    }
    
    async function put<T>(path: string, headers?: {
        [x: string]: string
    }, body?: any, apiVer?: number): Promise<T> {
        if (apiVer === undefined) apiVer = version;
        if (path.startsWith('/')) path = path.substring(1);
        let url = `/api/v${apiVer}/${path}`;

        return await doReq<T>(url, "PUT", headers, body);
    }
    
    async function patch<T>(path: string, headers?: {
        [x: string]: string
    }, body?: any, apiVer?: number): Promise<T> {
        if (apiVer === undefined) apiVer = version;
        if (path.startsWith('/')) path = path.substring(1);
        let url = `/api/v${apiVer}/${path}`;

        return await doReq<T>(url, "PATCH", headers, body);
    }
    
    async function del<T>(path: string, headers?: {
        [x: string]: string
    }, body?: any, apiVer?: number): Promise<T> {
        if (apiVer === undefined) apiVer = version;
        if (path.startsWith('/')) path = path.substring(1);
        let url = `/api/v${apiVer}/${path}`;

        return await doReq<T>(url, "DELETE", headers, body);
    }

    function getAuth(auth: string | null): string {
        if (auth == null) {
            auth = `Basic ${window.localStorage.getItem("auth")}`;
        }
        return auth;
    }
    
    return {
        "classrooms": {
            "list": async (auth: string | null = null): Promise<SongServer.API.Responses.ClassroomsAPIResponse> => {
                return await get("/classrooms", {
                    "Authorization": getAuth(auth)
                });
            },
            "create": async (body: SongServer.API.Client.Requests.CreateClassroomRequest, auth: string | null = null): Promise<SongServer.API.Responses.CreateClassroomAPIResponse> => {
                return await post("/classrooms", {
                    "Authorization": getAuth(auth),
                    "Content-Type": "application/json"
                }, JSON.stringify(body));
            },
            "classroom": (code: string) => {
                return {
                    "get": async (auth: string | null = null): Promise<SongServer.API.Responses.ClassroomAPIResponse> => {
                        return await get(`/classrooms/${code}`, {
                            "Authorization": getAuth(auth)
                        });
                    },
                    "modify": async (body: SongServer.API.Client.Requests.PatchClassroomRequest, auth: string | null = null): Promise<SongServer.API.Responses.ClassroomModifyAPIResponse> => {
                        return await patch(`/classrooms/${code}`, {
                            "Authorization": getAuth(auth),
                            "Content-Type": "application/json"
                        }, JSON.stringify(body));
                    },
                    "join": async (auth: string | null): Promise<SongServer.API.Responses.ClassroomJoinAPIResponse> => {
                        return await post(`/classrooms/${code}/students`, {
                            "Authorization": getAuth(auth)
                        });
                    },
                    "settings": {
                        "get": async (auth: string | null = null): Promise<SongServer.API.Responses.ClassroomSettingsAPIResponse> => {
                            return await get(`/classrooms/${code}/settings`, {
                                "Authorization": getAuth(auth)
                            });
                        },
                        "modify": async (body: SongServer.API.Client.Requests.PatchClassroomSettingsRequest, auth: string | null = null): Promise<SongServer.API.Responses.ClassroomModifySettingsAPIResponse> => {
                            return await patch(`/classrooms/${code}/settings`, {
                                "Authorization": getAuth(auth),
                                "Content-Type": "application/json"
                            }, JSON.stringify(body));
                        }
                    },
                    "removeStudent": async (studentEmail: string, auth: string | null = null): Promise<SongServer.API.Responses.ClassroomRemoveStudentAPIResponse> => {
                        return await del(`/classrooms/${code}/students/${studentEmail}`, {
                            "Authorization": getAuth(auth),
                        });
                    },
                    "playlist": {
                        "get": async (auth: string | null = null): Promise<SongServer.API.Responses.ClassroomPlaylistAPIResponse> => {
                            return await get(`/classrooms/${code}/playlist`, {
                                "Authorization": getAuth(auth),
                            });
                        },
                        "set": async (userEmail: string, playlistID: string, auth: string | null = null): Promise<SongServer.API.Responses.ClassroomNewPlaylistAPIResponse> => {
                            let body: SongServer.API.Client.Requests.SetPlaylistRequest = {
                                "playlistAuthor": userEmail,
                                "playlistID": playlistID
                            };

                            return await post(`/classrooms/${code}/playlist`, {
                                "Authorization": getAuth(auth),
                                "Content-Type": "application/json"
                            }, JSON.stringify(body));
                        },
                        "remove": async (auth: string | null = null): Promise<SongServer.API.Responses.ClassroomDeletePlaylistAPIResponse> => {
                            return await del(`/classrooms/${code}/playlist`, {
                                "Authorization": getAuth(auth),
                            });
                        },
                        "songs": {
                            "add": async (body: SongServer.API.Client.Requests.AddSongToClassroomPlaylistRequest, auth: string | null = null): Promise<SongServer.API.Responses.ClassroomAddSongAPIResponse> => {
                                return await post(`/classrooms/${code}/playlist/songs`, {
                                    "Authorization": getAuth(auth),
                                    "Content-Type": "application/json"
                                }, JSON.stringify(body));
                            },
                            "modify": async (body: SongServer.API.Client.Requests.ModifySongInClassroomPlaylistRequest, auth: string | null = null): Promise<SongServer.API.Responses.ClassroomMoveSongAPIResponse> => {
                                return await patch(`/classrooms/${code}/playlist/songs`, {
                                    "Authorization": getAuth(auth),
                                    "Content-Type": "application/json"
                                }, JSON.stringify(body));
                            },
                            "remove": async (body: SongServer.API.Client.Requests.RemoveSongToClassroomPlaylistRequest, auth: string | null = null): Promise<SongServer.API.Responses.ClassroomRemoveSongAPIResponse> => {
                                return await del(`/classrooms/${code}/playlist/songs`, {
                                    "Authorization": getAuth(auth),
                                    "Content-Type": "application/json"
                                }, JSON.stringify(body));
                            }
                        },
                        "shuffle": async (auth: string | null = null): Promise<SongServer.API.Responses.ClassroomShufflePlaylistAPIResponse> => {
                            return await post(`/classrooms/${code}/playlist/shuffle`, {
                                "Authorization": getAuth(auth),
                            });
                        }
                    }
                }
            }
            
        },
        "playlists": {
            "playlist": (playlistAuthor: string, playlistID: string) => {
                return {
                    "get": async (auth: string | null = null): Promise<SongServer.API.Responses.PlaylistInfoResponse> => {
                        return await get(`/playlists/${playlistAuthor}/${playlistID}`, {
                            "Authorization": getAuth(auth)
                        });
                    }
                }
            },
            "create": async (playlistAuthor: string, body: SongServer.API.Client.Requests.CreatePlaylistRequest, auth: string | null = null): Promise<SongServer.API.Responses.CreatePlaylistResponse> => {
                return await post(`/playlists/${playlistAuthor}/`, {
                    "Authorization": getAuth(auth),
                    "Content-Type": "application/json"
                }, JSON.stringify(body));
            }
        },
        "youtube": {
            "search": async (query: string): Promise<SongServer.API.Responses.SearchVideosAPIResponse> => {
                return await get(`/yt/videos?query=${encodeURI(query)}`);
            },
            "get": async (videoID: string): Promise<SongServer.API.Responses.FetchVideoAPIResponse> => {
                return await get(`/yt/videos/${videoID}`);
            }
        }
    }
}
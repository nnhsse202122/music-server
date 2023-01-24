/// <reference path="../../types/api.d.ts"/>

// const SongServer = {
//     "API": {
//         "SongModificationType": {
//             "NONE": 0,
//             "ADDED": 1,
//             "MOVED": 2,
//             "DELETED": 3,
//             "0": "NONE",
//             "1": "ADDED",
//             "2": "MOVED",
//             "3": "DELETED",
//         },
//         "APIResponseErrorCode": {
//             "REQUEST_ERROR": 0,
//             "INVALID": 1,
//             "0": "REQUEST_ERROR",
//             "1": "INVALID"
//         }
//     }
// }

const SongServerAPI = (apiVersion = 2): SongServer.API.SongServerAPIEndpoints => {
    let cookies = document.cookie.split(";").reduce((obj, cookie) => {
        let parts = cookie.split("=", 2);
        obj[parts[0].trim()] = parts[1];
        return obj;
    }, {} as Record<string, string>);

    async function handleReq<TData>(method: string, url: string, authorization: string | null | undefined, body?: any) {
        let authInfo = undefined;
        if (authorization !== undefined) {
            if (authorization === null) {
                let token = window.localStorage.getItem("auth");
                if (token != null) {
                    authInfo = `Basic ${token}`;
                }
                else if (cookies.authorization != null) {
                    authInfo = "Basic " + cookies.authorization;
                }
                else {
                    setTimeout(() => {
                        overlayManager.show("relogin-model");
                    }, 0);
                    throw new Error("No Authorization!");
                }
            }
            else {
                authInfo = authorization;
            }
        }
        let req = {
            "method": method,
            "body": body == null ? undefined : JSON.stringify(body),
            "headers": {
                "Authorization": authInfo,
                "Content-Type": body == null ? undefined : "application/json"
            }
        };
        let response: SongServer.API.APIResponse<TData>;
        try {
            // @ts-ignore
            let res = await fetch(url, req);
            response = await res.json();
            console.group("API Response");
            console.debug(`Received response from %c${url}`, "color: gold");
            console.debug(response);
            if (res.status == 401) {
                setTimeout(() => {
                    window.overlayManager.show("relogin-model");
                }, 0);
            }
            console.groupEnd();
        }
        catch (err) {
            response = {
                "success": false,
                "id": "api.request.error.internal",
                "message": "An internal error occurred while processing the request:\n" + err,
                "parameters": {
                    "error": "" + err
                },
                "status": 0
            };
        }
        return response;
    }
    function createUrl(url: string) {
        if (url.charAt(0) === '/')
            url = url.substring(1);
        return `${API_DOMAIN}/api/v${apiVersion}/${url}`;
    }
    async function getReq<TData>(url: string, authorization: string | null | undefined, body?: any) {
        return await handleReq<TData>("GET", createUrl(url), authorization, body);
    }
    async function deleteReq<TData>(url: string, authorization: string | null | undefined, body?: any) {
        return await handleReq<TData>("DELETE", createUrl(url), authorization, body);
    }
    async function postReq<TData>(url: string, authorization: string | null | undefined, body?: any) {
        return await handleReq<TData>("POST", createUrl(url), authorization, body);
    }
    async function patchReq<TData>(url: string, authorization: string | null | undefined, body?: any) {
        return await handleReq<TData>("PATCH", createUrl(url), authorization, body);
    }
    async function putReq<TData>(url: string, authorization: string | null | undefined, body?: any) {
        return await handleReq<TData>("PUT", createUrl(url), authorization, body);
    }

    return {
        "classrooms": {
            "create": (body: SongServer.API.Requests.CreateClassroomRequest, auth: string | null | undefined = null) => {
                return postReq("/classrooms", auth, body);
            },
            "find": (code: string) => {
                return {
                    "delete": (auth: string | null | undefined = null) => {
                        return deleteReq(`/classrooms/${code}`, auth);
                    },
                    "get": (auth: string | null | undefined = null) => {
                        return getReq(`/classrooms/${code}`, auth);
                    },
                    "playlist": {
                        "songs": {
                            "find": (index: number) => {
                                return {
                                    "like": (auth: string | null | undefined = null) => {
                                        return postReq(`/classrooms/${code}/playlist/songs/likes`, auth, { "index": index });
                                    },
                                    "prioritize": (auth: string | null | undefined = null) => {
                                        return postReq(`/classrooms/${code}/playlist/songs/prioritize`, auth, { "index": index });
                                    },
                                    "delete": (auth: string | null | undefined = null) => {
                                        return deleteReq(`/classrooms/${code}/playlist/songs`, auth, {
                                            "index": index
                                        });
                                    },
                                }
                            },
                            "add": (body: SongServer.API.Requests.AddClassroomSongRequest, auth: string | null | undefined = null) => {
                                return postReq(`/classrooms/${code}/playlist/songs`, auth, body);
                            },
                            "currentSong": {
                                "get": (auth: string | null | undefined = null) => {
                                    return getReq(`/classrooms/${code}/playlist/current-song`, auth);
                                },
                                "set": (index: number, auth: string | null | undefined = null) => {
                                    return postReq(`/classrooms/${code}/playlist/current-song/`, auth, { "index": index });
                                }
                            },
                            "list": (auth: string | null | undefined = null) => {
                                return getReq(`/classrooms/${code}/playlist/songs`, auth);
                            }
                        },
                        "nextSong": (auth: string | null | undefined = null) => {
                            return postReq(`/classrooms/${code}/playlist/next-song/`, auth);
                        },
                        "previousSong": (auth: string | null | undefined = null) => {
                            return postReq(`/classrooms/${code}/playlist/previous-song/`, auth);
                        },
                        "shuffle": (auth: string | null | undefined = null) => {
                            return postReq(`/classrooms/${code}/playlist/shuffle/`, auth);
                        }
                    },
                    "settings": {
                        "get": (auth: string | null | undefined = null) => {
                            return getReq(`/classrooms/${code}/settings`, auth);
                        },
                        "set": (body: SongServer.API.Requests.SetClassroomSettingsRequest, auth: string | null | undefined = null) => {
                            return postReq(`/classrooms/${code}/settings`, auth, body);
                        },
                        "update": (body: SongServer.API.Requests.UpdateClassroomSettingsRequest, auth: string | null | undefined = null) => {
                            return putReq(`/classrooms/${code}/settings`, auth, body);
                        }
                    },
                    "students": {
                        "find": (email: string) => {
                            return {
                                "remove": (auth: string | null | undefined = null) => {
                                    return deleteReq(`/classrooms/${code}/students/${email}`, auth);
                                },
                                "tokens": {
                                    "get": (auth: string | null | undefined = null) => {
                                        return getReq(`/classrooms/${code}/students/${email}/tokens`, auth);
                                    },
                                    "set": (tokens: number, auth: string | null | undefined = null) => {
                                        return postReq(`/classrooms/${code}/students/${email}/tokens`, auth, {
                                            "tokens": tokens
                                        });
                                    }
                                },
                                "likes": {
                                    "get": (auth: string | null | undefined = null) => {
                                        return getReq(`/classrooms/${code}/students/${email}/likes`, auth);
                                    },
                                    "set": (likes: number, auth: string | null | undefined = null) => {
                                        return postReq(`/classrooms/${code}/students/${email}/likes`, auth, {
                                            "likes": likes
                                        });
                                    }
                                }
                            }
                        },
                        "join": (auth: string | null | undefined = null) => {
                            return postReq(`/classrooms/${code}/students/`, auth);
                        },
                        "list": (auth: string | null | undefined = null) => {
                            return getReq(`/classrooms/${code}/students/`, auth);
                        },
                        "removeAll": (auth: string | null | undefined = null) => {
                            return deleteReq(`/classrooms/${code}/students/`, auth);
                        }
                    }
                }
            },
            "list": (auth: string | null | undefined = null) => {
                return getReq("/classrooms", auth);
            }
        },
        "authorization": {
            "auth": (body: SongServer.API.Requests.AuthorizeRequest) => {
                return Promise.resolve({
                    "success": false,
                    "id": "api.not_implemented",
                    "message": "Not implemented",
                    "status": 0,
                    "parameters": {}
                })
            }
        },
        "users": {
            "me": () => {
                return {
                    "get": (auth: string | null | undefined = null) => {
                        return getReq("/users/@me", auth);
                    }
                }
            },
            "find": (email: string) => {
                return {
                    "get": (auth: string | null | undefined = null) => {
                        return getReq(`/users/${email}`, auth);
                    }
                }
            }
        },
        "beans": {
            "get": () => {
                return getReq("/beans", undefined);
            },
            "set": (body: any) => {
                return postReq("/beans", undefined, body);
            }
        },
        "youtube": {
            "search": async (query: string, auth: string | null | undefined = null) => {
                return await getReq(`/yt/search?q=${encodeURIComponent(query)}`, auth);
            },
            "fetch": async (id: string, auth: string | null | undefined = null) => {
                return await getReq(`/yt/videos/${id}`, auth);
            }
        }
    };
};





"use strict";
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
const SongServerAPI = (apiVersion = 2) => {
    let cookies = document.cookie.split(";").reduce((obj, cookie) => {
        let parts = cookie.split("=", 2);
        obj[parts[0].trim()] = parts[1];
        return obj;
    }, {});
    async function handleReq(method, url, authorization, body) {
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
        let response;
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
    function createUrl(url) {
        if (url.charAt(0) === '/')
            url = url.substring(1);
        return `${API_DOMAIN}/api/v${apiVersion}/${url}`;
    }
    async function getReq(url, authorization, body) {
        return await handleReq("GET", createUrl(url), authorization, body);
    }
    async function deleteReq(url, authorization, body) {
        return await handleReq("DELETE", createUrl(url), authorization, body);
    }
    async function postReq(url, authorization, body) {
        return await handleReq("POST", createUrl(url), authorization, body);
    }
    async function patchReq(url, authorization, body) {
        return await handleReq("PATCH", createUrl(url), authorization, body);
    }
    async function putReq(url, authorization, body) {
        return await handleReq("PUT", createUrl(url), authorization, body);
    }
    return {
        "classrooms": {
            "create": (body, auth = null) => {
                return postReq("/classrooms", auth, body);
            },
            "find": (code) => {
                return {
                    "delete": (auth = null) => {
                        return deleteReq(`/classrooms/${code}`, auth);
                    },
                    "get": (auth = null) => {
                        return getReq(`/classrooms/${code}`, auth);
                    },
                    "playlist": {
                        "songs": {
                            "find": (index) => {
                                return {
                                    "like": (auth = null) => {
                                        return postReq(`/classrooms/${code}/playlist/songs/likes`, auth, { "index": index });
                                    },
                                    "prioritize": (auth = null) => {
                                        return postReq(`/classrooms/${code}/playlist/songs/prioritize`, auth, { "index": index });
                                    },
                                    "delete": (auth = null) => {
                                        return deleteReq(`/classrooms/${code}/playlist/songs`, auth, {
                                            "index": index
                                        });
                                    },
                                };
                            },
                            "add": (body, auth = null) => {
                                return postReq(`/classrooms/${code}/playlist/songs`, auth, body);
                            },
                            "currentSong": {
                                "get": (auth = null) => {
                                    return getReq(`/classrooms/${code}/playlist/current-song`, auth);
                                },
                                "set": (index, auth = null) => {
                                    return postReq(`/classrooms/${code}/playlist/current-song/`, auth, { "index": index });
                                }
                            },
                            "list": (auth = null) => {
                                return getReq(`/classrooms/${code}/playlist/songs`, auth);
                            }
                        },
                        "nextSong": (auth = null) => {
                            return postReq(`/classrooms/${code}/playlist/next-song/`, auth);
                        },
                        "previousSong": (auth = null) => {
                            return postReq(`/classrooms/${code}/playlist/previous-song/`, auth);
                        },
                        "shuffle": (auth = null) => {
                            return postReq(`/classrooms/${code}/playlist/shuffle/`, auth);
                        }
                    },
                    "settings": {
                        "get": (auth = null) => {
                            return getReq(`/classrooms/${code}/settings`, auth);
                        },
                        "set": (body, auth = null) => {
                            return postReq(`/classrooms/${code}/settings`, auth, body);
                        },
                        "update": (body, auth = null) => {
                            return putReq(`/classrooms/${code}/settings`, auth, body);
                        }
                    },
                    "students": {
                        "find": (email) => {
                            return {
                                "remove": (auth = null) => {
                                    return deleteReq(`/classrooms/${code}/students/${email}`, auth);
                                },
                                "tokens": {
                                    "get": (auth = null) => {
                                        return getReq(`/classrooms/${code}/students/${email}/tokens`, auth);
                                    },
                                    "set": (tokens, auth = null) => {
                                        return postReq(`/classrooms/${code}/students/${email}/tokens`, auth, {
                                            "tokens": tokens
                                        });
                                    }
                                },
                                "likes": {
                                    "get": (auth = null) => {
                                        return getReq(`/classrooms/${code}/students/${email}/likes`, auth);
                                    },
                                    "set": (likes, auth = null) => {
                                        return postReq(`/classrooms/${code}/students/${email}/likes`, auth, {
                                            "likes": likes
                                        });
                                    }
                                }
                            };
                        },
                        "join": (auth = null) => {
                            return postReq(`/classrooms/${code}/students/`, auth);
                        },
                        "list": (auth = null) => {
                            return getReq(`/classrooms/${code}/students/`, auth);
                        },
                        "removeAll": (auth = null) => {
                            return deleteReq(`/classrooms/${code}/students/`, auth);
                        }
                    }
                };
            },
            "list": (auth = null) => {
                return getReq("/classrooms", auth);
            }
        },
        "authorization": {
            "auth": (body) => {
                return Promise.resolve({
                    "success": false,
                    "id": "api.not_implemented",
                    "message": "Not implemented",
                    "status": 0,
                    "parameters": {}
                });
            }
        },
        "users": {
            "me": () => {
                return {
                    "get": (auth = null) => {
                        return getReq("/users/@me", auth);
                    }
                };
            },
            "find": (email) => {
                return {
                    "get": (auth = null) => {
                        return getReq(`/users/${email}`, auth);
                    }
                };
            }
        },
        "beans": {
            "get": () => {
                return getReq("/beans", undefined);
            },
            "set": (body) => {
                return postReq("/beans", undefined, body);
            }
        },
        "youtube": {
            "search": async (query, auth = null) => {
                return await getReq(`/yt/search?q=${encodeURIComponent(query)}`, auth);
            },
            "fetch": async (id, auth = null) => {
                return await getReq(`/yt/videos/${id}`, auth);
            }
        }
    };
};

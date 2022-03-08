const SongServer = {
    "API": {
        "SongModificationType": {
            "NONE": 0,
            "ADDED": 1,
            "MOVED": 2,
            "DELETED": 3,
            "0": "NONE",
            "1": "ADDED",
            "2": "MOVED",
            "3": "DELETED",
        },
        "APIResponseErrorCode": {
            "REQUEST_ERROR": 0,
            "INVALID": 1,
            "0": "REQUEST_ERROR",
            "1": "INVALID"
        }
    }
}

/** @param {SongServer.API.SongModificationType} type
 * @returns {"none" | "addition" | "moved" | "deleted"}
 */
function convertSongModificationTypeToString(type) {
    if (type === SongServer.API.SongModificationType.NONE) {
        return "none";
    }
    else if (type === SongServer.API.SongModificationType.ADDED) {
        return "addition";
    }
    else if (type === SongServer.API.SongModificationType.MOVED) {
        return "moved";
    }
    else if (type === SongServer.API.SongModificationType.DELETED) {
        return "deleted";
    }
    throw new TypeError("invalid modification type");
}
// @ts-ignore
const SongServerAPI = (apiVersion = 1) => {
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
                    authInfo =  "Basic OwO";
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
            let res = await fetch(url, req);
            response = await res.json();
            console.debug(`Received response from %c${url}`, "color: gold");
            console.debug(response);
        }
        catch (err) {
            response = {
                "message": new String(err),
                "success": false,
                "code": SongServer.API.APIResponseErrorCode.REQUEST_ERROR
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
        "classroom": function (code) {
            return {
                "delete": async (auth = null) => {
                    return await deleteReq(`/classrooms/${code}`, auth);
                },
                "students": {
                    "find": (email) => {
                        return {
                            "remove": async (auth = null) => {
                                return await deleteReq(`/classrooms/${code}/students/${email}`, auth);
                            },
                            "tokens": {
                                "get": async (auth = null) => {
                                    return await getReq(`/classrooms/${code}/students/${email}/tokens`, auth);
                                },
                                "set": async (tokens, auth = null) => {
                                    return await postReq(`/classrooms/${code}/students/${email}/tokens`, auth, {
                                        "tokens": tokens
                                    });
                                }
                            }
                        };
                    },
                    "join": async (auth = null) => {
                        return postReq(`/classrooms/${code}/students/`, auth);
                    },
                    "list": async (auth = null) => {
                        return await getReq(`/classrooms/${code}/students/`, auth);
                    },
                    "removeAll": async (auth = null) => {
                        return await deleteReq(`/classrooms/${code}/students/`, auth);
                    }
                },
                "settings": {
                    "get": async (auth = null) => {
                        return await getReq(`/classrooms/${code}/settings/`, auth);
                    },
                    "update": async (newSettings, auth = null) => {
                        return await patchReq(`/classrooms/${code}/settings/`, auth, newSettings);
                    },
                    "set": async (newSettings, auth = null) => {
                        return await postReq(`/classrooms/${code}/settings/`, auth, newSettings);
                    }
                },
                "playlist": {
                    "get": async (auth = null) => {
                        return await getReq(`/classrooms/${code}/playlist/`, auth);
                    },
                    "position": {
                        "get": async (auth = null) => {
                            return await getReq(`/classrooms/${code}/playlist/position`, auth);
                        },
                        "set": async (position, auth = null) => {
                            return await postReq(`/classrooms/${code}/playlist/position`, auth, {
                                "position": position
                            });
                        }
                    },
                    "shuffle": async (auth = null) => {
                        return await postReq(`/classrooms/${code}/playlist/shuffle/`, auth);
                    },
                    "songs": {
                        "get": async (auth = null) => {
                            return await getReq(`/classrooms/${code}/playlist/songs`, auth);
                        },
                        "move": async (oldIndex, newIndex, auth = null) => {
                            return await putReq(`/classrooms/${code}/playlist/songs`, auth, {
                                "oldIndex": oldIndex,
                                "newIndex": newIndex
                            });
                        },
                        "add": async (song, auth = null) => {
                            return await postReq(`/classrooms/${code}/playlist/songs`, auth, song);
                        },
                        "delete": async (index, auth = null) => {
                            return await deleteReq(`/classrooms/${code}/playlist/songs`, auth, {
                                "index": index
                            });
                        },
                    },
                }
            };
        },
        "createClassroom": async (body, auth = null) => {
            return await postReq(`/classrooms`, auth, body);
        },
        "youtube": {
            "search": async (query, auth = null) => {
                return await getReq(`/yt/search?q=${encodeURIComponent(query)}`, auth);
            }
        }
    };
};





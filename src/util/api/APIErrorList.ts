import APIFailResponse from "../../api/responses/APIFailResponse";

export let apiErrors = {
    "api.classroom.not_found": {
        "message": "Classroom not found.",
        "status": 404,
        "parameters": [],
    } as APIErrorInfo<"Classroom not found.", 404, []>,
    "api.classroom.not_joinable": {
        "message": "Classroom is not joinable.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"Classroom is not joinable.", 403, []>,
    "api.classroom.joined": {
        "message": "You have already joined this classroom.",
        "status": 400,
        "parameters": [],
    } as APIErrorInfo<"You have already joined this classroom.", 400, []>,
    "api.classrooms.delete.only_owner": {
        "message": "Only the owner can delete this classroom.",
        "status": 403,
        "parameters": []
    } as APIErrorInfo<"Only the owner can delete this classroom.", 403, []>,
    "api.classroom.playlist.hidden": {
        "message": "You aren't allowed to view the songs in the playlist.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"You aren't allowed to view the songs in the playlist.", 403, []>,
    "api.classroom.student.not_found": {
        "message": "Failed to find student! Email: {email}",
        "status": 404,
        "parameters": ["email"],
    } as APIErrorInfo<"Failed to find student! Email: {email}", 404, ["email"]>,
    "api.classroom.playlist.song.invalid_source": {
        "message": "Invalid song source! Source: {source}",
        "status": 400,
        "parameters": ["source"]
    } as APIErrorInfo<"Invalid song source! Source: {source}", 400, ["source"]>,
    "api.classroom.playlist.song.delete.fail": {
        "message": "Failed to delete song.",
        "status": 400,
        "parameters": [],
    } as APIErrorInfo<"Failed to delete song.", 400, []>,
    "api.classroom.playlist.song.move.fail": {
        "message": "Failed to move song.",
        "status": 400,
        "parameters": [],
    } as APIErrorInfo<"Failed to move song.", 400, []>,
    "api.classroom.playlist.song.add.fail": {
        "message": "Failed to add song.",
        "status": 400,
        "parameters": [],
    } as APIErrorInfo<"Failed to add song.", 400, []>,
    "api.classroom.playlist.song.add.exists": {
        "message": "That song already exists in the playlist.",
        "status": 400,
        "parameters": [],
    } as APIErrorInfo<"That song already exists in the playlist.", 400, []>,
    "api.classroom.playlist.song.not_found": {
        "message": "Song not found.",
        "status": 404,
        "parameters": [],
    } as APIErrorInfo<"Song not found.", 404, []>,
    "api.classroom.playlist.current_song.none": {
        "message": "There is no current song. This is most likely because the playlist is empty.",
        "status": 404,
        "parameters": [],
    } as APIErrorInfo<"There is no current song. This is most likely because the playlist is empty.", 404, []>,
    "api.classroom.delete.fail": {
        "message": "Only the owner of the classroom can delete the classroom.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"Only the owner of the classroom can delete the classroom.", 403, []>,
    "api.classroom.submissions.disabled": {
        "message": "Song submissions are disabled for this classroom.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"Song submissions are disabled for this classroom.", 403, []>,
    "api.classroom.submissions.tokens": {
        "message": "You don't have enough tokens to submit that song.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"You don't have enough tokens to submit that song.", 403, []>,
    "api.playlist.not_found": {
        "message": "Playlist not found.",
        "status": 404,
        "parameters": [],
    } as APIErrorInfo<"Playlist not found.", 404, []>,
    "api.playlist.song.likes.disabled": {
        "message": "Likes are disabled",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"Likes are disabled", 403, []>,
    "api.playlist.song.liked": {
        "message": "You already liked that song. L + Ratio",
        "status": 400,
        "parameters": [],
    } as APIErrorInfo<"You already liked that song. L + Ratio", 400, []>,
    "api.playlist.delete.fail": {
        "message": "Only the owner of the playlist can delete the playlist.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"Only the owner of the playlist can delete the playlist.", 403, []>,
    "api.authorization.token.required": {
        "message": "An authorization token is required.",
        "status": 401,
        "parameters": [],
    } as APIErrorInfo<"An authorization token is required.", 401, []>,
    "api.authorization.token.invalid": {
        "message": "Invalid authorization token.",
        "status": 401,
        "parameters": [],
    } as APIErrorInfo<"Invalid authorization token.", 401, []>,
    "api.authorization.header.required": {
        "message": "An authorization header is required for this route.",
        "status": 401,
        "parameters": [],
    } as APIErrorInfo<"An authorization header is required for this route.", 401, []>,
    "api.authorization.parts.invalid": {
        "message": "2 parts seperated by a space is required for authorization.",
        "status": 401,
        "parameters": [],
    } as APIErrorInfo<"2 parts seperated by a space is required for authorization.", 401, []>,
    "api.authorization.type.invalid": {
        "message": "Only Basic authorization is supported for now. Provided type: {type}",
        "status": 401,
        "parameters": ["type"],
    } as APIErrorInfo<"Only Basic authorization is supported for now. Provided type: {type}", 401, ["type"]>,
    "api.authorization.create": {
        "message": "Failed to create authorization session: {message}",
        "status": 400,
        "parameters": ["message"],
    } as APIErrorInfo<"Failed to create authorization session: {message}", 400, ["message"]>,
    "api.restrictions.teachers": {
        "message": "This endpoint is only available for teachers.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"This endpoint is only available for teachers.", 403, []>,
    "api.restrictions.students": {
        "message": "This endpoint is only available for students.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"This endpoint is only available for students.", 403, []>,
    "api.restrictions.teachers_owner": {
        "message": "This endpoint is only available for teachers or the owner of the resource.",
        "status": 403,
        "parameters": [],
    } as APIErrorInfo<"This endpoint is only available for teachers or the owner of the resource.", 403, []>,
    "api.user.not_found": {
        "message": "Failed to find the user specified with email {email}.",
        "status": 404,
        "parameters": ["email"],
    } as APIErrorInfo<"Failed to find the user specified with email {email}.", 404, ["email"]>,
    "api.yt.video.not_found": {
        "message": "Failed to find the youtube video with specified id {id}.",
        "status": 404,
        "parameters": ["id"],
    } as APIErrorInfo<"Failed to find the youtube video with specified id {id}.", 404, ["id"]>,
    "api.yt.search.invalid_query": {
        "message": "Invalid search query. Use the query parameter 'q' to search for videos.",
        "status": 400,
        "parameters": [],
    } as APIErrorInfo<"Invalid search query. Use the query parameter 'q' to search for videos.", 400, []>,
    "api.yt.search.not_found": {
        "message": "Failed to find the youtube search with specified query {query}.",
        "status": 404,
        "parameters": ["query"],
    } as APIErrorInfo<"Failed to find the youtube search with specified query {query}.", 404, ["query"]>,
    "api.body.content_type": {
        "message": "API Request Body Content-Type wasn't application/json.",
        "status": 400,
        "parameters": ["content_type"],
    } as APIErrorInfo<"API Request Body Content-Type wasn't application/json.", 400, ["content_type"]>,
    "api.body.null": {
        "message": "API Request Body was null.",
        "status": 400,
        "parameters": [],
    } as APIErrorInfo<"API Request Body was null.", 400, []>,
    "api.body.field.null": {
        "message": "Field '{field_name}' cannot be null. Path: {path}",
        "status": 400,
        "parameters": ["field_name","path","valid_types"],
    } as APIErrorInfo<"Field '{field_name}' cannot be null. Path: {path}", 400, ["field_name","path","valid_types"]>,
    "api.body.field.required": {
        "message": "Field '{field_name}' is required. Path: {path}",
        "status": 400,
        "parameters": ["field_name","path"],
    } as APIErrorInfo<"Field '{field_name}' is required. Path: {path}", 400, ["field_name","path"]>,
    "api.body.field.string": {
        "message": "Field '{field_name}' cannot be a string. Path: {path}",
        "status": 400,
        "parameters": ["field_name","path","valid_types"],
    } as APIErrorInfo<"Field '{field_name}' cannot be a string. Path: {path}", 400, ["field_name","path","valid_types"]>,
    "api.body.field.number": {
        "message": "Field '{field_name}' cannot be a number. Path: {path}",
        "status": 400,
        "parameters": ["field_name","path","valid_types"],
    } as APIErrorInfo<"Field '{field_name}' cannot be a number. Path: {path}", 400, ["field_name","path","valid_types"]>,
    "api.body.field.boolean": {
        "message": "Field '{field_name}' cannot be a boolean. Path: {path}",
        "status": 400,
        "parameters": ["field_name","path","valid_types"],
    } as APIErrorInfo<"Field '{field_name}' cannot be a boolean. Path: {path}", 400, ["field_name","path","valid_types"]>,
    "api.body.field.array": {
        "message": "Field '{field_name}' cannot be an array. Path: {path}",
        "status": 400,
        "parameters": ["field_name","path","valid_types"],
    } as APIErrorInfo<"Field '{field_name}' cannot be an array. Path: {path}", 400, ["field_name","path","valid_types"]>,
    "api.body.field.object": {
        "message": "Field '{field_name}' cannot be an object. Path: {path}",
        "status": 400,
        "parameters": ["field_name","path","valid_types"],
    } as APIErrorInfo<"Field '{field_name}' cannot be an object. Path: {path}", 400, ["field_name","path","valid_types"]>,
    "api.body.field.invalid_type": {
        "message": "Field '{field_name}' is an invalid type. Path: {path}",
        "status": 400,
        "parameters": ["field_name","path","valid_types"],
    } as APIErrorInfo<"Field '{field_name}' is an invalid type. Path: {path}", 400, ["field_name","path","valid_types"]>,

    "api.server": {
        "message": "Server had an internal error.",
        "status": 500,
        "parameters": [],
    } as APIErrorInfo< "Server had an internal error.", 500, []>
}

type ValuesIn<T extends any[]> = T[number];

type APIErrorInfoBase = {
    message: string,
    status: number,
    parameters: string[]
};

type APIErrorInfo<TMessage extends string, TStatus extends number, TParameters extends string[]> = APIErrorInfoBase & {
    message: TMessage,
    status: TStatus,
    parameters: TParameters
}

type APIErrorParameters<TAPIError> = TAPIError extends APIErrorInfo<any, any, infer TParameters> ? {
    [key in ValuesIn<TParameters>]: string
} : never;

type APIErrorStatus<TAPIError> = TAPIError extends APIErrorInfo<any, infer TStatus, any> ? TStatus : never; 

type GeneratedAPIError<TAPIError extends APIErrorInfoBase> = {
    message: string,
    status: APIErrorStatus<TAPIError>,
    parameters: APIErrorParameters<TAPIError>
}

type APIErrorDefinitions = {
    [id: string]: APIErrorInfoBase
}

type GetAPIErrorFromID<TDefinitions extends APIErrorDefinitions, TErrorID extends keyof TDefinitions> = TDefinitions[TErrorID];

export type GetAPIErrorFunction<TDefinitions extends APIErrorDefinitions> = (id: keyof TDefinitions, parameters: APIErrorParameters<GetAPIErrorFromID<TDefinitions, typeof id>>) => GeneratedAPIError<GetAPIErrorFromID<TDefinitions, typeof id>>
export type GetAsAPIErrorFunction<TDefinitions extends APIErrorDefinitions> = (id: keyof TDefinitions, parameters: APIErrorParameters<GetAPIErrorFromID<TDefinitions, typeof id>>) => APIFailResponse & GeneratedAPIError<GetAPIErrorFromID<TDefinitions, typeof id>> & {
    id: typeof id,
    success: false
}

// @ts-ignore
export let getAsAPIError: GetAsAPIErrorFunction<typeof apiErrors> = (id: string, parameters: { [x: string]: string }) => {
    // @ts-ignore
    let found = apiErrors[id] as APIErrorInfoBase;

    return {
        "id": id,
        "success": false,
        "status": found.status,
        "parameters": parameters,
        "message": found.message.replace(/\{([a-zA-Z_]+)\}/g, (m, paramName) => {
            let resolvedParameter = parameters[paramName];
            if (resolvedParameter != null) {
                return m;
            }
            return resolvedParameter;
        })
    };
}

// @ts-ignore
let getAPIError: GetAPIErrorFunction<typeof apiErrors> = (id: string, parameters: { [x: string]: string }) => {
    // @ts-ignore
    let found = apiErrors[id] as APIErrorInfoBase;

    return {
        "status": found.status,
        "parameters": parameters,
        "message": found.message.replace(/\{([a-zA-Z_]+)\}/g, (m, paramName) => {
            let resolvedParameter = parameters[paramName];
            if (resolvedParameter != null) {
                return m;
            }
            return resolvedParameter;
        })
    };
}

// todo: Make it so it doesn't show all suggestions for id parameters
//       Maybe this could be done with a source generator? I don't know if typescript supports source generators though...

export default getAPIError;
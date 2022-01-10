## Users

### GET `/api/v1/users/`
Gets the current user.

#### Query Parameters
Do not specify query parameters.

#### Headers
* `Authorization`: Basic Authorization containing the session id.

#### Body
Do not specify a body.

#### Response
```json
{
    "success": false,
    "message": string
}
```
or
```json
{
    "success": true,
    "data": {
        "type": string,
        "name": string,
        "email": string,
        "currentClass": string?
    }
}
```

## Classrooms

### GET `/api/v1/classrooms/`
Returns the classrooms for the current user.

#### Query Parameters
Do not specify query parameters

#### Headers
* `Authorization`: Basic Authorization containing the session id.

#### Body
Do not specify a body.

#### Response
```json
{
    "success": false,
    "message": string
}
```
or
```json
{
    "success": true,
    "data": {
        "role": string,
        "code": string,
        "name": string,
        "students": {
            "email": string,
            "name": string
        }[]?
    }[]
}
```
* `success`: A boolean indicating whether or not the request was successfully recognized by the server
* `data`: An array of objects only present when `success` is true, that represents all the classes found.
* `data[n].role`: The role the user is in this class. Only valid values are `"teacher"` and `"student"`
* `data[n].code`: The code for this classroom
* `data[n].name`: The name of this classroom
* `data[n].students`: An array of students, only present when `data[n].role` is the value `"teacher"`
* `data[n].students[i].email`: The email of the student
* `data[n].students[i].name`: The name of the student
* `message` A string value only present when `success` is false, that specifies the error message of why the request wasn't recognized by the server.

## Playlists

### GET `/api/v1/playlists/{playlist-id}`
Returns the info for the specified playlist.

### POST `/api/v1/playlists/{playlist-id}/songs`
Adds a song to the playlist with the specified ID.
* `playlist-id` The ID of the playlist to add the song to.

##### Query Parameters
Do not specify query parameters.

##### Body
```json
{
    "id": string,
    "source": SongSource,
    "requestedBy": {
        "email": string,
        "name": string
    }
}
```

* `id`: The ID of the song to add
* `source`: A valid song source. Right now, the only supported source is `youtube`
* `requestedBy`: An object containing properties of the user who added this song.
* `requestedBy.email`: The email of the user adding the song.
* `requestedBy.name` The name of the user adding the song.

##### Response
```json
{
    "success": true,
    "data": boolean
}
```
or
```json
{
    "success": false,
    "message": string
}
```

* `success`: A boolean indicating whether or not the request was successfully recognized by the server
* `data`: A boolean value only present when `success` is true, that specifies whether or not the song was successfully added to the playlist.
* `message` A string value only present when `success` is false, that specifies the error message of why the request wasn't recognized by the server.

### DELETE `/api/v1/playlists/{playlist-id}`
Deletes a playlist

### DELETE `/api/v1/playlists/{playlist-id}/songs/{song-id}`
Deletes a song with the specified

## Users

### GET `/api/v1/users`
Gets information about the current user.
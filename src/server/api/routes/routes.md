

## Playlists

#### GET `/api/v1/playlists/{playlist-id}`
Returns the info for the specified playlist.

#### POST `/api/v1/playlists/{playlist-id}/songs`
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

#### DELETE `/api/v1/playlists/{playlist-id}`
Deletes a playlist

#### DELETE `/api/v1/playlists/{playlist-id}/songs/{song-id}`
Deletes a song with the specified
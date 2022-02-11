import mongoose, { Schema } from "mongoose";
import IClassroom from "../interfaces/IClassroom";

const ClassroomSchema: Schema = new Schema<IClassroom>({
    name: { type: String, required: true },
    _id: { type: String, required: true },
    owner: { type: String, required: true },
    settings: {
        type: {
            allowSongSubmissions: { type: Boolean, required: true },
            submissionsRequireTokens: { type: Boolean, required: true },
            playlistVisible: { type: Boolean, required: true },
            joinable: { type: Boolean, required: true }
        },
        required: true
    },
    playlist: {
        type: {
            currentSongPosition: { type: Number, required: true },
            /*
                I fucking hate mongoose. Why can't I specify an array of schemas or whatever.
                I've tried looking:
                    - https://mongoosejs.com/docs/schematypes.html
                    - https://stackoverflow.com/questions/38639248/mongoose-model-for-multi-types-of-users
                    - https://github.com/Automattic/mongoose/issues/4929 
                    - https://mongoosejs.com/docs/guide.html
                None of these tell me how I can do this in typescript:
                type SongModification = SongAdded | SongDeleted | SongMoved | {
                    type: SongModificationType.NONE
                }
                type SongAdded = {
                    type: SongModificationType.ADDED,
                    index: int,
                    song: SongToAdd;
                }
                type SongDeleted = {
                    type: SongModificationType.DELETED,
                    index: int,
                }
                type SongMoved = {
                    type: SongModificationType.MOVED,
                    old_index: int,
                    new_index: int
                }

                Here is where the problem comes in: These song modifications are used inside another "schema"
                type ClassroomPlaylist = {
                    playlist: PlaylistReference | null,
                    songPosition: int,
                    modifications: SongModification[] <-- HERE
                }

                Any help for anyone overlooking this code would be greatly appreciated.
            */
            modifications: {
                type: [
                    {
                        type: { type: Number, required: true },
                        // SongAdded and SongDeleted
                        index: { type: Number, required: false },
                        // SongAdded
                        song: { 
                            type: {
                                id: { type: String, required: false },
                                title: { type: String, required: false },
                                source: { type: String, required: false },
                                requested_by: {
                                    email: { type: String, required: false },
                                    name: { type: String, required: false }
                                }
                            },
                            required: false
                        },
                        // SongMoved
                        old_index: { type: Number, required: false },
                        new_index: { type: Number, required: false },
                    },
                ],
                required: true
            },
            playlist: { 
                type: {
                    id: { type: String, required: true },
                    owner: { type: String, required: true }
                },
                required: false,
                default: null
            }
        },
        required: true
    },
    students: {
        type: [
            {
                type: {
                    name: { type: String, required: true },
                    email: { type: String, required: true },
                    tokens: { type: Number, required: true }
                },
                required: true
            }
        ],
        required: true
    }
}, {
    "toJSON": {
        "virtuals": true
    },
    "toObject": {
        "virtuals": true
    }
});
// im crying about this...
ClassroomSchema.virtual("code").get(() => {
    // @ts-ignore
    return this._id;
});

export default mongoose.model<IClassroom>("Classroom", ClassroomSchema);
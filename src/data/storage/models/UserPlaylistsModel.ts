import mongoose, { Schema } from "mongoose";
import IUserPlaylists from "../interfaces/IUserPlaylists";

const UserPlaylistsSchema = new Schema<IUserPlaylists>({
    playlists: {
        type: [
            {
                id: { type: String, required: true },
                playlistOwner: { type: String, required: true },
                visibility: { type: Number, required: true },
                songs: {
                    type: [
                        {
                            id: { type: String, required: true },
                            title: { type: String, required: true },
                            source: { type: String, required: true },
                            requested_by: {
                                type: {
                                    email: { type: String, required: true },
                                    name: { type: String, required: true },
                                },
                                required: true
                            },
                            position: { type: Number, required: true }
                        }
                    ],
                    required: true
                }
            }
        ],
        required: true
    },
    _id: { type: String, required: true }
}, {
    "toJSON": {
        "virtuals": true
    },
    "toObject": {
        "virtuals": true
    }
});

UserPlaylistsSchema.virtual("email").get(() => {
    // @ts-ignore
    return this._id;
});

export default mongoose.model<IUserPlaylists>("UserPlaylists", UserPlaylistsSchema);
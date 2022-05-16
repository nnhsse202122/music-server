import mongoose, { Schema } from "mongoose";
import IClassroomV2 from "../interfaces/IClassroomV2";

const ClassroomV2Schema: Schema = new Schema<IClassroomV2>({
    name: { type: String, required: true },
    _id: { type: String, required: true },
    owner: { type: String, required: true },
    settings: {
        type: {
            allowSongSubmissions: { type: Boolean, required: true },
            submissionsRequireTokens: { type: Boolean, required: true },
            playlistVisible: { type: Boolean, required: true },
            joinable: { type: Boolean, required: true },
            likesEnabled: { type: Boolean, required: true },
            priorityEnabled: { type: Boolean, required: true },
            priorityCost: { type: Number, required: true },
            likesVisible: { type: Boolean, required: true }
        },
        required: true
    },
    playlist: {
        type: {
            songs: {
                type: [
                    { 
                        type: {
                            id: { type: String, required: true },
                            requested_by: {
                                type: {
                                    email: { type: String, required: true },
                                    name: { type: String, required: true }
                                },
                                required: true
                            },
                            source: { type: String, required: true },
                            title: { type: String, required: true },
                            likes: {
                                type: [
                                    { type: String, required: true }
                                ],
                                required: true
                            }
                        },
                        required: true
                    }
                ],
                required: true
            },
            priority: {
                type: [
                    { 
                        type: {
                            id: { type: String, required: true },
                            requested_by: {
                                type: {
                                    email: { type: String, required: true },
                                    name: { type: String, required: true }
                                },
                                required: true
                            },
                            source: { type: String, required: true },
                            title: { type: String, required: true }
                        },
                        required: true
                    }
                ],
                required: true
            },
            currentSong: {
                type: {
                    index: { type: Number, required: true },
                    fromPriority: { type: Boolean, required: true }
                },
                required: true
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
ClassroomV2Schema.virtual("code").get(() => {
    // @ts-ignore
    return this._id;
});

export default mongoose.model<IClassroomV2>("ClassroomV2", ClassroomV2Schema);
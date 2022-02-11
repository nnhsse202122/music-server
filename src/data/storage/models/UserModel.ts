import mongoose, { Schema } from "mongoose";
import IUser from "../interfaces/IUser";


const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    _id: { type: String, required: true },
    profile_url: { type: String, required: false },
    classes: {
        type: [
            {
                code: { type: String, required: true }
            }
        ],
        required: true
    },
    playlists: {
        type: [
            {
                id: { type: String, required: true }
            }
        ],
        required: true
    },
    type: {
        type: Number,
        required: true
    }
},  {
    "toJSON": {
        "virtuals": true
    },
    "toObject": {
        "virtuals": true
    }
});

UserSchema.virtual("email").get(() => {
    // @ts-ignore
    return this._id;
});

export default mongoose.model<IUser>("User", UserSchema);




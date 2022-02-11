import mongoose, { Schema } from "mongoose";
import ISession from "../interfaces/ISession";

const SessionsSchema = new Schema<ISession>({
    accessToken: { type: String, required: true },
    email: { type: String, required: true },
    expiresAfter: { type: Number, required: true },
    name: { type: String, required: true },
    _id: { type: String, required: true }
});

SessionsSchema.virtual("id").get(() => {
    // @ts-ignore
    return this._id;
});

export default mongoose.model<ISession>("Session", SessionsSchema);
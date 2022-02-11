import { Document } from "mongoose";
import { i32 as int } from "typed-numbers";

export default interface ISession extends Document {
    email: string,
    accessToken: string,
    expiresAfter: int,
    name: string,
    id: string
}
import { i32 as int } from "typed-numbers";

type CreatedSession = {
    expires_at: int,
    token: string,
    email: string,
    profile_url: string,
    name: string
};

export default CreatedSession;
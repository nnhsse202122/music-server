import { i32 as int } from "typed-numbers";

type AuthorizeResponse = {
    expires_at: int,
    token: string
};

export default AuthorizeResponse;
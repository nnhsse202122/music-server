import { i32 as int } from "typed-numbers";

type Session = {
    email: string,
    accessToken: string,
    expiresAfter: int,
    name: string,
    id: string
}

export default Session;
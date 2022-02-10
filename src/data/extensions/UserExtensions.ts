import Classroom from "../classrooms/Classroom";
import User from "../users/User";

export function isInClassCode(user: User, code: string) {
    // probably could set up a hash map to make this more efficient?
    for (let index = 0; index < user.classes.length; index++) {
        var userClass = user.classes[index];
        if (userClass.code == code) {
            return true;
        }
    }

    return false;
}

export function isInClass(user: User, classroom: Classroom): boolean {
    return isInClassCode(user, classroom.code);
}
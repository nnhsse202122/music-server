import Role from "../data/users/Role";
// @ts-ignore
import devConfig from "../../../dev-config";

const VALID_DISTRICTS = [
    "naperville203"
];

const VALID_DISTRICTS_REGEX = () => {
    let builder = "";
    for (let index = 0; index < VALID_DISTRICTS.length; index++) {
        if (index > 0) builder += "|";
        builder += VALID_DISTRICTS[index];
    }
    return builder.toString();
}

export const VALID_EMAIL_REGEX = new RegExp(`^([a-zA-Z0-9_]+)@(stu\\.)?${VALID_DISTRICTS_REGEX()}\\.org$`);

export function getRoleFromEmail(email: string): Role | null {
    if (devConfig.teachers.includes(email)) {
        return Role.Teacher
    }

    let match = email.match(VALID_EMAIL_REGEX);
    if (match == null) return null;

    if (match[2] == null) {
        return Role.Teacher;
    }

    return Role.Student;
}

import OutParam from "../../util/OutParam";
import StudentInClass from "../classrooms/StudentInClass";
import User from "../users/User";
import { i32 as int } from "typed-numbers";
import UserDataBase from "../storage/UserDataBase";
import Role from "../users/Role";
import ClassroomV2 from "../classrooms/ClassroomV2";
import ClassroomV2DataBase from "../storage/ClassroomV2DataBase";

export function getStudent(classroom: ClassroomV2, email: string): StudentInClass {
    for (let i = 0; i < classroom.students.length; i++) {
        let student = classroom.students[i];
        if (student.email === email) {
            return student;
        }
    }
    throw new Error("KeyNotFoundException: Failed to find student with email '" + email + "'");
}

export function getStudentFromUser(classroom: ClassroomV2, user: User): StudentInClass {
    return getStudent(classroom, user.email);
}

export function tryGetStudent(classroom: ClassroomV2, email: string, student: OutParam<StudentInClass>): boolean {
    for (let i = 0; i < classroom.students.length; i) {
        let stu = classroom.students[i];
        if (stu.email === email) {
            student.value = stu;
            return true;
        }
    }

    student.value = undefined;
    return false;
}

export function tryGetStudentFromUser(classroom: ClassroomV2, user: User, student: OutParam<StudentInClass>): boolean {
    return tryGetStudent(classroom, user.email, student);
}

export class RemovedStudentInfo {
    public updatedClassroom: ClassroomV2;
    public updatedUser: User;
    public success: boolean;

    public constructor(classroom: ClassroomV2, user: User, success: boolean) {
        this.updatedClassroom = classroom;
        this.updatedUser = user;
        this.success = success;
    }
};

export class RemovedAllStudentsInfo {
    public updatedClassroom: ClassroomV2;
    public failedCount: int;
    public get success(): boolean {
        return this.failedCount === 0;
    }

    public constructor(classroom: ClassroomV2, failedCount: int) {
        this.updatedClassroom = classroom;
        this.failedCount = failedCount;
    }
}

export async function removeAllStudents(classroom: ClassroomV2, classroomDB: ClassroomV2DataBase, userDB: UserDataBase): Promise<RemovedAllStudentsInfo> {
    let students = classroom.students;
    let failedCount = 0;
    for (let index = 0; index < students.length; index++) {
        let student = students[index];

        let removedStudentInfo = await removeStudentFromStudent(classroom, classroomDB, userDB, student);
        classroom = removedStudentInfo.updatedClassroom;
        if (!removedStudentInfo.success) {
            failedCount++;
        }
    }

    return new RemovedAllStudentsInfo(classroom, int(failedCount));
}

export function removeStudentFromStudent(classroom: ClassroomV2, classroomDB: ClassroomV2DataBase, userDB: UserDataBase, student: StudentInClass): Promise<RemovedStudentInfo> {
    return removeStudentFromEmail(classroom, classroomDB, userDB, student.email);
}

export async function removeStudentFromEmail(classroom: ClassroomV2, classroomDB: ClassroomV2DataBase, userDB: UserDataBase, userEmail: string): Promise<RemovedStudentInfo> {
    if (!await userDB.contains(userEmail)) {
        return new RemovedStudentInfo(classroom, {
            "classes": [],
            "email": "",
            "name": "",
            "playlists": [],
            "profile_url": "",
            "type": Role.Student
        }, false);
    }

    let user = await userDB.get(userEmail);
    return await removeStudent(classroom, classroomDB, userDB, user);
}

export async function removeStudent(classroom: ClassroomV2, classroomDB: ClassroomV2DataBase, userDB: UserDataBase, user: User): Promise<RemovedStudentInfo> {
    if (user.type !== Role.Student) {
        return new RemovedStudentInfo(classroom, user, false);
    }

    classroom.students = classroom.students.filter((u) => u.email !== user.email);
    user.classes = user.classes.filter((c) => c.code !== classroom.code);

    let success: boolean = await classroomDB.set(classroom.code, classroom);
    success = await userDB.set(user.email, user) && success;
    
    return new RemovedStudentInfo(classroom, user, success);
}


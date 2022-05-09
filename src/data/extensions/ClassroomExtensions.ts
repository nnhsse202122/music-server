import OutParam from "../../util/OutParam";
import Classroom from "../classrooms/Classroom";
import StudentInClass from "../classrooms/StudentInClass";
import User from "../users/User";
import { i32 as int } from "typed-numbers";
import ClassroomDataBase from "../storage/ClassroomDataBase";
import UserDataBase from "../storage/UserDataBase";
import Role from "../users/Role";
import ClassroomV2 from "../classrooms/ClassroomV2";
import ClassroomV2DataBase from "../storage/ClassroomV2DataBase";

export function getStudent(classroom: Classroom, email: string): StudentInClass {
    for (let i = 0; i < classroom.students.length; i) {
        let student = classroom.students[i];
        if (student.email === email) {
            return student;
        }
    }
    throw new Error("KeyNotFoundException: Failed to find student with email '" + email + "'");
}

export function getStudentV2(classroom: ClassroomV2, email: string): StudentInClass {
    for (let i = 0; i < classroom.students.length; i) {
        let student = classroom.students[i];
        if (student.email === email) {
            return student;
        }
    }
    throw new Error("KeyNotFoundException: Failed to find student with email '" + email + "'");
}

export function getStudentFromUser(classroom: Classroom, user: User): StudentInClass {
    return getStudent(classroom, user.email);
}

export function tryGetStudent(classroom: Classroom, email: string, student: OutParam<StudentInClass>): boolean {
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

export function tryGetStudentFromUser(classroom: Classroom, user: User, student: OutParam<StudentInClass>): boolean {
    return tryGetStudent(classroom, user.email, student);
}

export class RemovedStudentInfo<TClassroom = Classroom> {
    public updatedClassroom: TClassroom;
    public updatedUser: User;
    public success: boolean;

    public constructor(classroom: TClassroom, user: User, success: boolean) {
        this.updatedClassroom = classroom;
        this.updatedUser = user;
        this.success = success;
    }
};

export class RemovedAllStudentsInfo<TClassroom = Classroom> {
    public updatedClassroom: TClassroom;
    public failedCount: int;
    public get success(): boolean {
        return this.failedCount === 0;
    }

    public constructor(classroom: TClassroom, failedCount: int) {
        this.updatedClassroom = classroom;
        this.failedCount = failedCount;
    }
}

export async function removeAllStudents(classroom: Classroom, classroomDB: ClassroomDataBase, userDB: UserDataBase): Promise<RemovedAllStudentsInfo> {
    let students = classroom.students;
    let failedCount = 0;
    for (let index = 0; index < students.length; index++) {
        let student = students[index];

        let removedStudentInfo = await removeStudentFromClassroom(classroom, classroomDB, userDB, student);
        classroom = removedStudentInfo.updatedClassroom;
        if (!removedStudentInfo.success) {
            failedCount++;
        }
    }

    return new RemovedAllStudentsInfo(classroom, int(failedCount));
}

export async function removeAllStudentsV2(classroom: ClassroomV2, classroomDB: ClassroomV2DataBase, userDB: UserDataBase): Promise<RemovedAllStudentsInfo<ClassroomV2>> {
    let students = classroom.students;
    let failedCount = 0;
    for (let index = 0; index < students.length; index++) {
        let student = students[index];

        let removedStudentInfo = await removeStudentFromClassroomV2(classroom, classroomDB, userDB, student);
        classroom = removedStudentInfo.updatedClassroom;
        if (!removedStudentInfo.success) {
            failedCount++;
        }
    }

    return new RemovedAllStudentsInfo<ClassroomV2>(classroom, int(failedCount));
}

export function removeStudentFromClassroom(classroom: Classroom, classroomDB: ClassroomDataBase, userDB: UserDataBase, student: StudentInClass): Promise<RemovedStudentInfo> {
    return removeStudentFromEmail(classroom, classroomDB, userDB, student.email);
}

export function removeStudentFromClassroomV2(classroom: ClassroomV2, classroomDB: ClassroomV2DataBase, userDB: UserDataBase, student: StudentInClass): Promise<RemovedStudentInfo<ClassroomV2>> {
    return removeStudentFromEmailV2(classroom, classroomDB, userDB, student.email);
}

export async function removeStudentFromEmail(classroom: Classroom, classroomDB: ClassroomDataBase, userDB: UserDataBase, userEmail: string): Promise<RemovedStudentInfo> {
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

export async function removeStudentFromEmailV2(classroom: ClassroomV2, classroomDB: ClassroomV2DataBase, userDB: UserDataBase, userEmail: string): Promise<RemovedStudentInfo<ClassroomV2>> {
    if (!await userDB.contains(userEmail)) {
        return new RemovedStudentInfo<ClassroomV2>(classroom, {
            "classes": [],
            "email": "",
            "name": "",
            "playlists": [],
            "profile_url": "",
            "type": Role.Student
        }, false);
    }

    let user = await userDB.get(userEmail);
    return await removeStudentV2(classroom, classroomDB, userDB, user);
}

export async function removeStudent(classroom: Classroom, classroomDB: ClassroomDataBase, userDB: UserDataBase, user: User): Promise<RemovedStudentInfo> {
    if (user.type !== Role.Student) {
        return new RemovedStudentInfo(classroom, user, false);
    }

    classroom.students = classroom.students.filter((u) => u.email !== user.email);
    user.classes = user.classes.filter((c) => c.code !== classroom.code);

    let success: boolean = await classroomDB.set(classroom.code, classroom);
    success = await userDB.set(user.email, user) && success;
    
    return new RemovedStudentInfo(classroom, user, success);
}

export async function removeStudentV2(classroom: ClassroomV2, classroomDB: ClassroomV2DataBase, userDB: UserDataBase, user: User): Promise<RemovedStudentInfo<ClassroomV2>> {
    if (user.type !== Role.Student) {
        return new RemovedStudentInfo<ClassroomV2>(classroom, user, false);
    }

    classroom.students = classroom.students.filter((u) => u.email !== user.email);
    user.classes = user.classes.filter((c) => c.code !== classroom.code);

    let success: boolean = await classroomDB.set(classroom.code, classroom);
    success = await userDB.set(user.email, user) && success;
    
    return new RemovedStudentInfo<ClassroomV2>(classroom, user, success);
}
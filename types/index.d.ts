
declare namespace SongServer.Data {
    type Classroom = {
        /** The class name */
        name: string,
        /** The class code */
        code: string,
        /** The teacher that manages this classroom */
        teacher: string,
        /** The list of students by email */
        students: string[],
        /** Classroom settings */
        settings: ClassroomSettings,
    }

    type ClassroomSettings = {
        allowSongSubmission: boolean,
        joinable: boolean
    };

    // container for holding info for classes for a teacher/student
    type UserBase<TType extends string> = {
        /** The type of user */
        type: TType,
        /** The name of the user */
        name: string,
        /** The user email */
        email: string,
        /** The list of classrooms by ID. */
        classrooms: UserClass[]
    };

    type UserClass = {
        code: string,
    }

    type TeacherUser = UserBase<"teacher">;
    type StudentUser = UserBase<"student">;

    type User = TeacherUser | StudentUser;
}

declare namespace SongServer.API {
    type ClassroomSettingsInfo = {
        allowSongSubmission: boolean,
        joinable: boolean
    };

    type UserInfoBase<TType extends string> = {
        type: TType;
        name: string;
        email: string,
    }

    type TeacherInfo = UserInfoBase<"teacher">;
    type StudentInfo = UserInfoBase<"student"> & {
        currentClass: string | null
    };

    type UserInfo = TeacherInfo | StudentInfo;

    type ClassroomRole = "student" | "teacher"

    type ClassroomInfoBase<TRole extends ClassroomRole> = {
        role: TRole,
        name: string,
        code: string
    }

    type StudentClassroomInfo = ClassroomInfoBase<"student">;
    type TeacherClassroomInfo = ClassroomInfoBase<"teacher"> & {
        students: SongServer.API.StudentInfo[]
    }

    type ClassroomInfo = StudentClassroomInfo | TeacherClassroomInfo;

    type PlaylistInfo = {
        id: string,
        songs: SongInfo[]
    }

    type SongInfo = {
        id: string,
        requested_by: string
    }

    // type containing information of a fetched video using the search
    // option for the youtube api, or for a singular video
    type FetchedVideo = {
        /** The title of the video */
        title: string,
        /** The video id */
        id: string
    }


}

declare namespace SongServer.API.Responses {
    type SuccessAPIResponse<TData> = {
        data: TData,
        success: true;
    }

    type FailAPIResponse = {
        message: string,
        success: false;
    }
    type APIResponse<TData> = SuccessAPIResponse<TData> | FailAPIResponse;

    type DeleteResponse = APIResponse<boolean>;

    type FetchVideoAPIResponse = APIResponse<FetchedVideo>;
    type SearchVideosAPIResponse = APIResponse<FetchedVideo[]>;

    type ClassroomsAPIResponse = APIResponse<ClassroomInfo[]>;
    type ClassroomAPIResponse = APIResponse<ClassroomInfo>;
    type ClassroomSettingsAPIResponse = APIResponse<ClassroomSettingsInfo>;

    type ClassroomStudentAPIResponse = APIResponse<StudentInfo>;
    type ClassroomStudentsAPIResponse = APIResponse<StudentInfo[]>;
    type ClassroomAddStudentAPIResponse = APIResponse<boolean>;
    type ClassroomRemoveStudentAPIResponse = DeleteResponse;

    type DeletePlaylistResponse = DeleteResponse;
    type DeleteSongFromPlaylistResponse = DeleteResponse;
    type PlaylistInfoResponse = APIResponse<PlaylistInfo | null>;

    type FetchUserResponse = APIResponse<UserInfo>;
}

declare namespace SongServer.API.Server.Requests {
    type PatchClassroomRequest = {
        name?: any
    }

    type PatchClassroomSettingsRequest = {
        allowSongSubmission?: any,
        joinable?: any
    }

    type CreateClassroomRequest = {
        name?: any,
        joinable?: any,
        allowSongSubmissions?: any
    };
}

declare namespace SongServer.API.Client.Requests {
    type PatchClassroomRequest = {
        name?: string
    }

    type PatchClassroomSettingsRequest = {
        allowSongSubmission?: boolean,
        joinable?: boolean
    }

    type CreateClassroomRequest = {
        name?: string,
        joinable?: boolean,
        allowSongSubmissions?: boolean
    };
}
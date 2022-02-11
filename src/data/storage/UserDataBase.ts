import User from "../users/User";
import CollectionDataBase from "./CollectionDataBase";
import IUser from "./interfaces/IUser";
import UserModel from "./models/UserModel";

function dbUserToUser(user: IUser): User {
    return {
        "email": user._id as string,
        "classes": user.classes.map((c) => {
            return {
                "code": c.code
            }
        }),
        "name": user.name,
        "playlists": user.playlists.map((p) => {
            return {
                "id": p.id
            }
        }),
        "profile_url": user.profile_url,
        "type": user.type
    };
}

function userToDBUser(user: User): IUser {
    return new UserModel({
        "_id": user.email,
        "classes": user.classes.map((c) => {
            return {
                "code": c.code
            }
        }),
        "name": user.name,
        "playlists": user.playlists.map((p) => {
            return {
                "id": p.id
            }
        }),
        "profile_url": user.profile_url,
        "type": user.type
    });
}

function updateDBUser(user: User, dbUser: IUser): void {
    dbUser.name = user.name;
    dbUser.classes = user.classes.map((c) => {
        return {
            "code": c.code
        };
    });
    dbUser.playlists = user.playlists.map((p) => {
        return {
            "id": p.id
        };
    });
    dbUser.profile_url = user.profile_url,
    dbUser.type = user.type;
};

export default class UserDataBase extends CollectionDataBase<string, User> {
    
    private async _get(email: string): Promise<IUser> {
        let fetchedUser = await UserModel.findById(email).exec();
        if (fetchedUser === null) {
            throw new Error("No user with email '" + email + "'");
        }

        return fetchedUser;
    } 

    public async get(email: string): Promise<User> {
        return dbUserToUser(await this._get(email));
    }

    public async add(email: string, user: User): Promise<boolean> {
        if (await this.contains(email)) return false;
        let u = userToDBUser(user);
        await u.save();
        return true;
    }
    public async set(email: string, user: User): Promise<boolean> {
        if (!await this.contains(email)) return false;
        let userDB = await this._get(email);

        updateDBUser(user, userDB);
        await userDB.save();

        return true;
    }
    public async contains(email: string): Promise<boolean> {
        return (await UserModel.findById(email).exec()) != null;
    }
    public async delete(email: string): Promise<boolean> {
        if (!await this.contains(email)) return false;
        await UserModel.findByIdAndDelete(email).exec();
        return !await this.contains(email);
    }

    
}
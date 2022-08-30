import { UserEntity } from "../../database/entities/User";
import { IUser } from "./IUser";

export class UserService {
    async createUser(User: IUser) {
        var userEntity = new UserEntity(User);
        return await userEntity.create();
    }
}
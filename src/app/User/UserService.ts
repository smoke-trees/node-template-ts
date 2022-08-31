import { UserEntity } from "../../database/entities/User";
import { IUser } from "./IUser";

export class UserService {
    async createUser(User: IUser) {
        var userEntity = new UserEntity(User);
        return await userEntity.create();
    }

    async getUser(id: string) {
        return await UserEntity.read<UserEntity>(id);
    }

    async deleteUser(id: string) {
        return await UserEntity.delete<UserEntity>(id);
    }

    async updateUser(user: Partial<UserEntity>) {
        const userToEdit = await UserEntity.read<UserEntity>(user.id);
        if (userToEdit.error.error) {
            return userToEdit;
        } else {
            const entity: UserEntity = userToEdit.result!;
            entity.name = user.name ? user.name : entity.name;
            entity.email = user.email ? user.email : entity.email;
            entity.customFields = user.customFields ? user.customFields : entity.customFields;
            const updateResult = await entity.update(entity.id);
            return updateResult;
        }
    }
}
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUser } from "../../app/IUser";
import { ICustomField } from "../../app/ICustomField";
import BaseEntity from "./BaseEntity";

@Entity({ name: 'User', schema: 'benefits' })
export class UserEntity extends BaseEntity implements IUser {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string

    @Column({ name: 'employee_id', type: 'varchar', nullable: false })
    name!: string;

    @Column({ name: 'email', type: 'varchar' })
    email!: string

    @Column({ name: 'custom_fields', type: 'json', nullable: true })
    customFields?: ICustomField[] | undefined;

    constructor(data: IUser) {
        super();
        this.name = data.name;
        this.email = data.email;
        this.customFields = data.customFields ?? [];
        if (data.id) {
            this.id = data.id;
        }
    }
}
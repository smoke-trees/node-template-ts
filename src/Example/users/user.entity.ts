import { BaseEntity, Validator } from '@smoke-trees/postgres-backend';
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUser } from "./IUser";

@Entity({ name: 'user_test_table' })
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  name!: string;

  constructor(it?: IUser) {
    super()
    if (it) {
      this.name = it.name
    }
  }
}
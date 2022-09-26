import { BaseEntity, Database, Documentation, Validator } from '@smoke-trees/postgres-backend';
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUser } from "./IUser";

@Entity({ name: 'user_test_table' })
@Documentation.addSchema({ type: 'object' })
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @Documentation.addField({ type: 'number' })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  @Documentation.addField({ type: 'string', minLength: 3, maxLength: 255 })
  name!: string;

  constructor(it?: IUser) {
    super()
    if (it) {
      this.name = it.name
    }
  }
}
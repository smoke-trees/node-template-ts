import { BaseEntity, Documentation, Validator } from '@smoke-trees/postgres-backend';
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUser } from "./IUser";

// @Entity({ name: 'user_test_table' })
@Documentation.addSchema({ type: 'object' })
export class BaseUser extends BaseEntity  {
  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  @Documentation.addField({ type: 'string', minLength: 3, maxLength: 255 })
  lastName!: string;

  constructor(it?: IUser) {
    super()
    if (it) {
      this.lastName = it.name
    }
  }
}
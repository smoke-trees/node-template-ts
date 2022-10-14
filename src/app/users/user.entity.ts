import { BaseEntity, Database, Documentation, Validator } from '@smoke-trees/postgres-backend';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { BaseUser } from './baseUserEntity';
import { IUser } from "./IUser";

@Entity({ name: 'user_test_table' })
@Documentation.addSchema({ type: 'object' })
export class User extends BaseUser implements IUser {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @Documentation.addField({ type: 'number' })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  @Documentation.addField({ type: 'string', minLength: 3, maxLength: 255 })
  name!: string;

  @Column('date', { name: 'date_of_birth', nullable: true })
  @Documentation.addField({ type: 'string', format: 'date', nullable: true })
  dateOfBirth!: Date | null;

  constructor(it?: IUser) {
    super(it)
    if (it) {
      this.name = it.name
      this.dateOfBirth = it.dateOfBirth
    }
  }
}
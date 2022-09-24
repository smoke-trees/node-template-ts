import {  Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../core/BaseEntity";
import { Validator } from "../../core/Validator";
import { IUser } from "./IUser";

@Entity({ name: 'user_test_table' })
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  name!: string;

  constructor(it: Partial<IUser>) {
    super();
    if (it) {
      this.name = it.name!;
    }
  }
}
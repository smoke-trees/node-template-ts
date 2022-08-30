import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../core/BaseEntity";
import { Validator } from "../../core/Validator";

@Entity({ name: 'user_test_table' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  name!: string;

  constructor(it: Partial<User>) {
    super();
    Object.assign(this, it);
  }
}
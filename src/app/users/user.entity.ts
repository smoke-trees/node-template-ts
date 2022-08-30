import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../core/BaseEntity";

@Entity({ name: 'user_test_table' })
export  class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  name!: string;

  constructor(it: Partial<User>) {
    super();
    Object.assign(this, it);
  }
}
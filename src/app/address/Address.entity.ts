import { BaseEntity, Documentation } from "@smoke-trees/postgres-backend";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'address_demo' })
@Documentation.addSchema({ type: 'object' })
export class Address extends BaseEntity {

  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @Documentation.addField({ type: "number" })
  id!: number;

  @Column({ name: 'line1', type: 'varchar' })
  @Documentation.addField({ type: "string" })
  line1!: string;

  @Column({ name: 'line2', type: 'varchar' })
  @Documentation.addField({ type: "string" })
  line2!: string;

  @Column({ name: 'city', type: 'varchar' })
  @Documentation.addField({ type: "string" })
  city!: string;

  @Column({ name: 'state', type: 'varchar' })
  @Documentation.addField({ type: "string" })
  state!: string;

}
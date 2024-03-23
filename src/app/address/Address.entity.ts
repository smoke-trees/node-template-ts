import { BaseEntity, Documentation } from "@smoke-trees/postgres-backend";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users";

export interface IAddress {
  userId: number;
  line1: string;
  line2: string;
  city: string;
  state: string;
}

@Entity({ name: "address_demo" })
@Documentation.addSchema({ type: "object" })
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn("increment", { name: "id" })
  @Documentation.addField({ type: "number" })
  id!: number;

  @Column({ name: "user_id", type: "int", nullable: true })
  @Documentation.addField({ type: "number" })
  userId!: number;

  @Column({ name: "line1", type: "varchar" })
  @Documentation.addField({ type: "string" })
  line1!: string;

  @Column({ name: "line2", type: "varchar" })
  @Documentation.addField({ type: "string" })
  line2!: string;

  @Column({ name: "city", type: "varchar" })
  @Documentation.addField({ type: "string" })
  city!: string;

  @Column({ name: "state", type: "varchar" })
  @Documentation.addField({ type: "string" })
  state!: string;

  @ManyToOne(() => User, { eager: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: User;

  constructor(address?: IAddress) {
    super(address);

    if (address) {
      this.userId = address.userId;
      this.line1 = address.line1;
      this.line2 = address.line2;
      this.city = address.city;
      this.state = address.state;
    }
  }
}

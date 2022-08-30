import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export class BaseEntity {
  static entityName: 'BaseEntity';
  id!: string | number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
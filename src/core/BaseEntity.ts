import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export interface BaseEntityConstructor<T> {
  new(data?: any): T;
}

export function createEntity<T>(ctor: BaseEntityConstructor<T>, data: any) {
  return new ctor(data);
}

export class BaseEntity {
  static entityName: 'BaseEntity';
  id!: string | number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  constructor(data?: any) {
    Object.assign(this, data);
    return this
  }
}
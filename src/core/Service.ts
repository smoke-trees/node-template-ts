import { FindOneOptions, FindOptionsWhere } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IResult } from "../result";
import { BaseEntity } from "./BaseEntity";
import { Dao } from "./Dao";

export interface IService<Entity extends BaseEntity> {
  readOne(id: number | string): Promise<IResult<Entity>>;
  readMany(page?: number, count?: number, order?: 'ASC' | 'DESC', field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<IResult<Entity[]>>;
  readManyWithoutPagination(order: 'ASC' | 'DESC', field: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<IResult<Entity[]>>;
  create(value: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],): Promise<IResult<string | number>>;
  update(id: string | number | FindOptionsWhere<Entity>, values: QueryDeepPartialEntity<Entity>): Promise<IResult<number>>;
  delete(id: string | number | string[] | FindOptionsWhere<Entity>): Promise<IResult<number>>;
}

export abstract class Service<Entity extends BaseEntity> implements IService<Entity> {
  dao: Dao<Entity>;
  constructor(dao: Dao<Entity>) {
    this.dao = dao
  }
  readOne(filter: string | number | FindOneOptions<Entity>): Promise<IResult<Entity>> {
    return this.dao.read(filter)
  }
  readMany(page = 1, count = 10, order: 'ASC' | 'DESC' = 'DESC', field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[])
    : Promise<IResult<Entity[]>> {
    return this.dao.readMany(page, count, order, field, where)
  }
  readManyWithoutPagination(order: 'ASC' | 'DESC' = 'DESC', field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]):
    Promise<IResult<Entity[]>> {
    return this.dao.readManyWithoutPagination(order, field, where)
  }
  create(value: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],): Promise<IResult<number | string>> {
    return this.dao.create(value)
  }
  update(id: string | number | FindOptionsWhere<Entity>, values: QueryDeepPartialEntity<Entity>): Promise<IResult<number>> {
    return this.dao.update(id, values)
  }
  delete(id: string | number | string[] | FindOptionsWhere<Entity>): Promise<IResult<number>> {
    return this.dao.delete(id)
  }

}
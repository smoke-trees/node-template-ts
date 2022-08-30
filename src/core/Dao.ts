import { EntityManager, EntityTarget, FindOneOptions, FindOptionsWhere } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { ErrorCodes, IResult } from "../result";
import { BaseEntity } from "./BaseEntity";
import Database from "./database";
import log from "./log";

export class Dao<Entity extends BaseEntity> {
  protected database: Database;
  protected entity: EntityTarget<Entity>;
  protected entityName: string;
  static getDao<T extends BaseEntity>(database: Database, entity: EntityTarget<T>, name: string) {
    return new this(database, entity, name)
  }
  constructor(database: Database, entity: EntityTarget<Entity>, name: string) {
    this.database = database
    this.entity = entity
    this.entityName = name
  }
  async create(value: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[], manager?: EntityManager): Promise<IResult<number | string>> {
    if (!manager) {
      manager = (await this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);
    try {
      const result = await repository.insert(value);
      if (!(value instanceof Array)) {
        value.id = result.identifiers[0].id;
      }
      log.info("Successfully created", `${this.entityName}/create`, {});
      return {
        status: {
          error: false,
          code: ErrorCodes.SUCCESS
        },
        message: "Success in insert",
        result: result.identifiers[0].id
      }
    } catch (error) {
      log.error(`Error in inserting ${this.entityName}`, `${this.entityName}/insert`, error, { values: this });
      return {
        status: {
          error: true,
          code: ErrorCodes.DATABASE_ERROR
        },
        message: "Error in insert",
        result: null
      }
    }
  }

  async read(value: string | number | FindOneOptions<Entity>, manager?: EntityManager): Promise<IResult<Entity>> {
    if (!manager) {
      manager = (await this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);
    try {
      let options: FindOneOptions;
      if (typeof value === "number" || typeof value === "string") {
        options = { where: { id: value } }
      } else {
        options = value
      }
      const result = await repository.findOne(options);
      if (!result) {
        log.debug("Find not found", `${this.entityName}/read`, { id: value });
        return {
          status: {
            error: true,
            code: ErrorCodes.NOT_FOUND
          },
          message: "Not found",
          result: null
        }
      }
      log.debug("Successfully found", `${this.entityName}/read`, { id: value });
      return {
        status: {
          error: false,
          code: ErrorCodes.SUCCESS
        },
        message: "Success in read",
        result: result
      }
    } catch (error) {
      log.error("Error in reading", `${this.update}/read`, error, { id: value });
      return {
        status: {
          error: true,
          code: ErrorCodes.DATABASE_ERROR
        },
        message: "Error in reading",
        result: null
      }
    }
  }

  async update(id: string | number | FindOptionsWhere<Entity>, values: QueryDeepPartialEntity<Entity>, manager?: EntityManager): Promise<IResult<number>> {

    if (!manager) {
      manager = (await this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);
    let copy = { ...values };
    try {
      const result = await repository.update(id, copy);
      if (result.affected === 0) {
        log.debug("Update not found", `${this.entityName}/update`, { id,  });
        return {
          status: {
            error: true,
            code: ErrorCodes.NOT_FOUND
          },
          message: "Not found",
          result: null
        }
      }
      log.debug("Successfully updated", `${this.entityName}/update`, { id,  });
      return {
        status: {
          error: false,
          code: ErrorCodes.SUCCESS
        },
        message: "Success in update",
        result: result.affected ?? null
      }
    } catch (error) {
      log.error("Error in updating", `${this.entityName}/update`, error, { id,  copy });
      return {
        status: {
          error: true,
          code: ErrorCodes.DATABASE_ERROR
        },
        message: "Error in updating ",
        result: null
      }
    }
  }

  async readMany(page = 1, count = 10, order: 'ASC' | 'DESC' = 'DESC', field: keyof Entity = 'createdAt',
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[], manager?: EntityManager): Promise<IResult<Entity[]>> {
    if (!manager) {
      manager = (await this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);

    try {
      const orderValue: any = { [field]: order }
      const result = await repository.find({
        where,
        skip: (page - 1) * count,
        take: count,
        order: orderValue,
      });
      if (result.length === 0) {
        log.debug("Find not found", `${this.entityName}/readMany`, { page, count, order, field });
        return {
          status: {
            error: true,
            code: ErrorCodes.NOT_FOUND
          },
          message: "Not found",
          result: null
        }
      }
      log.debug("Successfully found", `${this.entityName}/readMany`, { page, count, order, field });
      return {
        status: {
          error: false,
          code: ErrorCodes.SUCCESS
        },
        message: "Success in readMany",
        result
      }
    } catch (error) {
      log.error("Error in reading", `${this.entityName}/readMany`, error, { page, count, order, field });
      return {
        status: {
          error: true,
          code: ErrorCodes.DATABASE_ERROR
        },
        message: "Error in reading ",
        result: null
      }
    }
  }

  async readManyWithoutPagination(order: 'ASC' | 'DESC' = 'DESC', field: keyof Entity = 'createdAt', where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[], manager?: EntityManager)
    : Promise<IResult<Entity[]>> {
    if (!manager) {
      manager = (await this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);


    try {
      const orderValue: any = { [field]: order }
      const result = await repository.find({
        order: orderValue,
        where
      });
      if (result.length === 0) {
        log.debug("Find not found", `${this.entityName}/readManyWithoutPagination`, { order, field, where });
        return {
          status: {
            error: true,
            code: ErrorCodes.NOT_FOUND
          },
          message: "Not found",
          result: null
        }
      }
      log.debug("Successfully found", `${this.entityName}/readManyWithoutPagination`, { order, field });
      return {
        status: {
          error: false,
          code: ErrorCodes.SUCCESS
        },
        message: "Success in readMany",
        result
      }
    } catch (error) {
      log.error("Error in reading", `${this.entityName}/readManyWithoutPagination`, error, { order, field });
      return {
        status: {
          error: true,
          code: ErrorCodes.DATABASE_ERROR
        },
        message: "Error in reading ",
        result: null
      }
    }
  }

  async delete(id: string | number | string[] | FindOptionsWhere<Entity>, manager?: EntityManager): Promise<IResult<number>> {
    if (!manager) {
      manager = (await this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);
    try {
      const result = await repository.delete(id);

      if (result.affected === 0) {
        log.debug("Delete not found", `${this.entityName}/delete`, { id });
        return {
          status: {
            error: true,
            code: ErrorCodes.NOT_FOUND
          },
          message: "Not found",
          result: result.affected
        }
      }
      log.debug("Successfully deleted", `${this.entityName}/delete`, { id });
      return {
        status: {
          error: false,
          code: ErrorCodes.SUCCESS
        },
        message: "Success in delete",
        result: result.affected ?? 0
      }
    } catch (error) {
      log.error("Error in deleting", `${this.entityName}/delete`, error, { id });
      return {
        status: {
          error: true,
          code: ErrorCodes.DATABASE_ERROR
        },
        message: "Error in deleting",
        result: null
      }
    }
  }
}
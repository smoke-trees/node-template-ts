import { CreateDateColumn, EntityManager, EntityTarget, FindOneOptions, FindConditions, getConnection, Repository, UpdateDateColumn } from "typeorm";
import log from "../../core/log";
import { ErrorCodes, IResult } from "../../IResult";

export interface IBaseEntity {
  createdAt?: Date;
  updatedAt?: Date;
}

export default abstract class BaseEntity {
  static idFieldName = "id";

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  async create(manager?: EntityManager): Promise<IResult<string>> {
    if (!manager) {
      manager = getConnection().createEntityManager()
    }
    const repository = manager.getRepository(this.constructor);
    try {

      const result = await repository.insert(this);
      if (!(this as any)[(this.constructor as any).idFieldName]) {
        (this as any)[(this.constructor as any).idFieldName] = result.generatedMaps[0][(this.constructor as any).idFieldName];
      }
      log.info("Successfully created", `${this.constructor.name}/create`, {});
      return {
        error: {
          error: false,
          code: ErrorCodes.Success
        },
        message: "Success in insert",
        result: (this as any)[(this.constructor as any).idFieldName]
      }
    } catch (error) {
      log.error(`Error in inserting ${this.constructor.name}`, `${this.constructor.name}/insert`, error, { values: this });
      return {
        error: {
          error: true,
          code: ErrorCodes.DatabaseError
        },
        message: "Error in insert"
      }
    }
  }

  static async read<T extends BaseEntity>(id?: string | number, options?: FindOneOptions<T>, manager?: EntityManager): Promise<IResult<T>> {
    if (!manager) {
      manager = getConnection().createEntityManager()
    }
    const repository = manager.getRepository<T>(this);
    try {
      const idFieldName = (this.constructor as any).idFieldName as string ?? (this.idFieldName)
      const result = await repository.findOne({ where: { [idFieldName]: id } as FindConditions<T>, ...options });
      if (!result) {
        log.debug("Find not found", `${this.name}/read`, { id });
        return {
          error: {
            error: true,
            code: ErrorCodes.NotFound
          },
          message: "Not found",
        }
      }
      log.debug("Successfully found", `${this.name}/read`, { id });
      return {
        error: {
          error: false,
          code: ErrorCodes.Success
        },
        message: "Success in read",
        result: result
      }
    } catch (error) {
      log.error("Error in reading", `${this.name}/read`, error, { id });
      return {
        error: {
          error: true,
          code: ErrorCodes.DatabaseError
        },
        message: "Error in reading "
      }
    }
  }

  async update(id: string | number, entityManager?: EntityManager): Promise<IResult<undefined>> {
    if (!entityManager) {
      entityManager = getConnection().createEntityManager()
    }
    const repository = entityManager.getRepository(this.constructor);
    let copy
    try {
      copy = Object.create(this.constructor.prototype);
      copy = { ...this } as any
      if (copy.idFieldName) {
        delete copy.idFieldName
      }
      if (copy.updatedAt) {
        delete copy.updatedAt
      }
      const result = await repository.update(id, copy);
      if (result.affected === 0) {
        log.debug("Update not found", `${this.constructor.name}/update`, { id, values: this });
        return {
          error: {
            error: true,
            code: ErrorCodes.NotFound
          },
          message: "Not found",
        }
      }
      log.debug("Successfully updated", `${this.constructor.name}/update`, { id, values: this });
      return {
        error: {
          error: false,
          code: ErrorCodes.Success
        },
        message: "Success in update",
      }
    } catch (error) {
      log.error("Error in updating", `${this.constructor.name}/update`, error, { id, values: this, copy });
      return {
        error: {
          error: true,
          code: ErrorCodes.DatabaseError
        },
        message: "Error in updating "
      }
    }
  }

  static async readMany<T extends BaseEntity>(page = 1, count = 10, order: 'ASC' | 'DESC' = 'DESC', field = 'createdAt', where?: FindConditions<T> | FindConditions<T>[], manager?: EntityManager) {
    let repository: Repository<T>;
    if (manager) {
      repository = manager.getRepository<T>(this);
    } else {
      const connection = getConnection()
      repository = connection.getRepository<T>(this);
    }
    try {
      const orderValue: any = { [field]: order }
      const result = await repository.find({
        skip: (page - 1) * count,
        take: count,
        order: orderValue,
        where
      });
      if (result.length === 0) {
        log.debug("Find not found", `${this.name}/readMany`, { page, count, order, field });
        return {
          error: {
            error: true,
            code: ErrorCodes.NotFound
          },
          message: "Not found",
        }
      }
      log.debug("Successfully found", `${this.name}/readMany`, { page, count, order, field });
      return {
        error: {
          error: false,
          code: ErrorCodes.Success
        },
        message: "Success in readMany",
        result
      }
    } catch (error) {
      log.error("Error in reading", `${this.name}/readMany`, error, { page, count, order, field });
      return {
        error: {
          error: true,
          code: ErrorCodes.DatabaseError
        },
        message: "Error in reading "
      }
    }
  }

  static async readManyWithoutPagination<T extends BaseEntity>(order: 'ASC' | 'DESC' = 'DESC', field = 'createdAt', where?: FindConditions<T> | FindConditions<T>[], manager?: EntityManager) {
    let repository: Repository<T>;
    if (manager) {
      repository = manager.getRepository<T>(this);
    } else {
      const connection = getConnection()
      repository = connection.getRepository<T>(this);
    }
    try {
      const orderValue: any = { [field]: order }
      const result = await repository.find({
        order: orderValue,
        where
      });
      if (result.length === 0) {
        log.debug("Find not found", `${this.name}/readManyWithoutPagination`, { order, field, where });
        return {
          error: {
            error: true,
            code: ErrorCodes.NotFound
          },
          message: "Not found",
        }
      }
      log.debug("Successfully found", `${this.name}/readManyWithoutPagination`, { order, field });
      return {
        error: {
          error: false,
          code: ErrorCodes.Success
        },
        message: "Success in readMany",
        result
      }
    } catch (error) {
      log.error("Error in reading", `${this.name}/readManyWithoutPagination`, error, { order, field });
      return {
        error: {
          error: true,
          code: ErrorCodes.DatabaseError
        },
        message: "Error in reading "
      }
    }
  }

  static async delete<T extends BaseEntity>(id: string | number | string[] | FindConditions<T>, manager?: EntityManager): Promise<IResult<number>> {
    if (!manager) {
      manager = getConnection().createEntityManager()
    }
    const repository = manager.getRepository(this as unknown as EntityTarget<unknown>);
    try {
      const result = await repository.delete(id);

      if (result.affected === 0) {
        log.debug("Delete not found", `${this.name}/delete`, { id });
        return {
          error: {
            error: true,
            code: ErrorCodes.NotFound
          },
          message: "Not found",
          result: result.affected
        }
      }
      log.debug("Successfully deleted", `${this.name}/delete`, { id });
      return {
        error: {
          error: false,
          code: ErrorCodes.Success
        },
        message: "Success in delete",
        result: result.affected ?? 0
      }
    } catch (error) {
      log.error("Error in deleting", `${this.name}/delete`, error, { id });
      return {
        error: {
          error: true,
          code: ErrorCodes.DatabaseError
        },
        message: "Error in deleting "
      }
    }
  }
}


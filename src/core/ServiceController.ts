import { Request, Response } from "express";
import Application from "./app";
import { BaseEntity, BaseEntityConstructor, createEntity } from "./BaseEntity";
import Controller, { Methods, Route } from "./controller";
import { Service } from "./Service";

export interface IServiceControllerPathOptions {
  read: boolean;
  readMany: boolean;
  readManyWithoutPagination: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface IServiceControllerOptions {
  paths: {
    [key: string]: boolean;
    read: boolean;
    readMany: boolean;
    readManyWithoutPagination: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  }
}

export abstract class ServiceController<Entity extends BaseEntity> extends Controller {
  protected routes: Route[];
  public service: Service<Entity>;
  private optionsPath: IServiceControllerPathOptions;
  private EntityConstructor: BaseEntityConstructor<Entity>

  constructor(app: Application, entityConstructor: BaseEntityConstructor<Entity>, service: Service<Entity>, options?: IServiceControllerOptions) {
    super(app)
    this.service = service
    this.optionsPath = {
      create: true,
      delete: true,
      read: true,
      readMany: true,
      readManyWithoutPagination: true,
      update: true
    }
    this.EntityConstructor = entityConstructor
    this.routes = []
    if (this.optionsPath.create) {
      this.routes.push({
        handler: this.create.bind(this),
        localMiddleware: [],
        method: Methods.POST,
        path: '/'
      })
    }
    if (this.optionsPath.readMany) {
      this.routes.push({
        handler: this.readAll.bind(this),
        localMiddleware: [],
        method: Methods.GET,
        path: '/'
      })
    }
    if (this.optionsPath.read) {
      this.routes.push({
        handler: this.readById.bind(this),
        localMiddleware: [],
        method: Methods.GET,
        path: '/:id'
      })
    }
    if (this.optionsPath.update) {
      this.routes.push({
        handler: this.update.bind(this),
        localMiddleware: [],
        method: Methods.PUT,
        path: '/:id'
      })
    }
    if (this.optionsPath.delete) {
      this.routes.push({
        handler: this.delete.bind(this),
        localMiddleware: [],
        method: Methods.DELETE,
        path: '/:id'
      })
    }
  }
  async create(req: Request, res: Response) {
    const entity = createEntity<Entity>(this.EntityConstructor, req.body)
    const response = await this.service.create(entity as any)
    res.status(200).json(response)
  }

  async readAll(req: Request, res: Response) {
    const { orderBy, order, page, count, nonPaginated, ...filter } = req.query
    let pageNumberParsed = parseInt(page?.toString() ?? '1')
    let countParsed = parseInt(count?.toString() ?? '10')
    if (isNaN(pageNumberParsed)) {
      pageNumberParsed = 1
    }
    if (isNaN(countParsed)) {
      countParsed = 10
    }
    let orderParsed: string = order?.toString() ?? "DESC"
    if (order !== 'DESC' && order !== 'ASC') {
      orderParsed = 'DESC'
    }
    let result
    if (nonPaginated?.toString() === 'true') {
      result = await this.service.readManyWithoutPagination(orderParsed as 'ASC' | "DESC", orderBy?.toString() as keyof Entity, filter as any)
    } else {
      result = await this.service.readMany(pageNumberParsed, countParsed, orderParsed as 'ASC' | "DESC", orderBy?.toString() as keyof Entity, filter as any)
    }
    res.status(200).json(result)
  }
  async readById(req: Request, res: Response) {
    const { id } = req.params
    const result = await this.service.readOne(id)
    res.status(200).json(result)
  }
  async update(req: Request, res: Response) {
    const { id } = req.params
    const body = req.body
    const result = await this.service.update(id, body)
    res.status(200).json(result)
  }
  async delete(req: Request, res: Response) {
    const { id } = req.params
    const result = await this.service.delete(id)
    res.status(200).json(result)
  }
}
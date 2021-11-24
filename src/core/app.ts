import express, { Application as ExpressApplication, RequestHandler } from 'express'
import { Server } from 'http'
import compression from 'compression'
import cors from 'cors'
import { ContextProvider } from '@smoke-trees/smoke-context'
import morgan from './morgan'
import log from './log'
import Controller from './controller'
import RouteHandler from './RouteHandler'
import Database from './database'
import settings from './settings'

export default class Application extends RouteHandler {
  private readonly app: ExpressApplication
  private readonly controllers: Controller[];
  protected readonly port: string;
  protected mw: RequestHandler[];
  protected database: Database;

  constructor() {
    const app = express()
    super(app)
    this.app = app
    this.port = process.env.PORT || '8080'
    this.controllers = []
    this.mw = []
    this.setMiddleware()
    this.loadMiddleware()
    this.database = new Database(this)
    this.connectToDatabase()
  }


  public async run(): Promise<Server> {
    return this.app.listen(this.port, () => {
      log.info(`Started server on port ${this.port}`, 'Application.run')
    })
  }

  public getApp(): ExpressApplication {
    return this.app
  }

  public loadControllers(): void {
    this.controllers.forEach((controller) => {
      this.app.use(controller.path, controller.setRoutes())
    })
  }

  public addController(controller: Controller): void {
    this.controllers.push(controller)
  }

  public setMiddleware(): void {
    this.mw.push(cors())
    this.mw.push(morgan)
    this.mw.push(ContextProvider.getMiddleware({ headerName: 'X-Request-ID' }))
    this.mw.push(compression())
  }

  public connectToDatabase(): void {
    this.database.connect()
  }
}

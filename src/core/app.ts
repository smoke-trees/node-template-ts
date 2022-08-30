import '../config'
import express, { Application as ExpressApplication, RequestHandler } from 'express'
import { Server } from 'http'
import compression from 'compression'
import cors from 'cors'
import { ContextProvider } from '@smoke-trees/smoke-context'
import morgan from './morgan'
import log from './log'
import Controller from './controller'
import RouteHandler from './RouteHandler'
import yaml from 'yamljs'
import path from 'path'
import swaggerUI from 'swagger-ui-express'
import settings, { Settings } from './settings'
import Database from './database'

export default class Application extends RouteHandler {
  private readonly app: ExpressApplication
  private readonly controllers: Controller[];
  protected settings: Settings;
  protected readonly port: string;
  protected mw: RequestHandler[];
  protected _database: Database;


  public get database(): Database {
    return this._database
  }

  constructor() {
    const app = express()
    super(app)
    this.app = app
    this.port = process.env.PORT || '8080'
    this.controllers = []
    this.mw = [] 
    this.settings = settings
    this.setMiddleware()
    this.loadMiddleware()
    this._database = new Database()
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

  loadDocumentation() {
    // const swaggerDocument = yaml.load(path.resolve(__dirname, '..', '..', 'docs', 'build', 'docs.yaml'))
    // this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
  }

  public setMiddleware(): void {
    this.mw.push(cors())
    this.mw.push(morgan)
    this.mw.push(ContextProvider.getMiddleware({ headerName: 'X-Request-ID' }))
    this.mw.push(compression())
    this.mw.push(express.json())
    this.mw.push(express.urlencoded({ extended: true }))
    this.loadDocumentation()
  }
}

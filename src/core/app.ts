import express, { Application as ExpressApplication, RequestHandler } from 'express'
import { Server } from 'http'
import log from './log'
import Controller from './controller'
import RouteHandler from './RouteHandler'
import Database from './database'
import { Settings } from './settings'

export default class Application extends RouteHandler {
  private readonly app: ExpressApplication
  private readonly controllers: Controller[];
  protected readonly port: string;
  protected mw: RequestHandler[];
  public settings: Settings;
  public database: Database;

  constructor(settings: Settings = new Settings(), db: Database = new Database(settings, true)) {
    const app = express()
    super(app)
    this.app = app
    this.settings = settings
    this.port = process.env.PORT || '8080'
    this.controllers = []
    this.mw = []
    this.setMiddleware()
    this.database = db
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
    this.app.use('/health', (req, res) => { res.status(200).json({ message: "Health is good" }) })
    this.app.use('*', (req, res) => { res.status(404).json({ message: "Not Found" }) })
  }

  public addController(controller: Controller): void {
    this.controllers.push(controller)
  }

  public addMiddleWare(...middleware: RequestHandler[]): void {
    this.mw.push(...middleware)
  }
}

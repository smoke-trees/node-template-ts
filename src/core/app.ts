import express, { Application as ExpressApplication, RequestHandler } from 'express'
import compression from 'compression'
import cors from 'cors'
import { ContextProvider } from '@smoke-trees/smoke-context'
import morgan from './morgan'
import log from './log'
import Controller from './controller'
import RouteHandler from './RouteHandler'
import Settings from './settings'


export default class Application extends RouteHandler {
  private readonly app: ExpressApplication
  private readonly controllers: Controller[];
  protected settings: Settings;
  protected readonly port: string;
  protected mw: RequestHandler[];

  constructor() {
    const app = express()
    super(app)
    this.app = app
    this.port = process.env.PORT || '8080'
    this.controllers = []
    this.mw = []
    this.settings = new Settings()
    this.setMiddleware()
    this.loadMiddleware()
  }

  public run() {
    return this.app.listen(this.port, () => {
      log.info(`Started server on port ${this.port}`, 'Application.run')
    })
  }

  public getApp() {
    return this.app
  }


  public loadControllers() {
    this.controllers.forEach((controller) => {
      this.app.use(controller.path, controller.setRoutes())
    })

  }

  public addController(controller: Controller) {
    this.controllers.push(controller)
  }

  public setMiddleware() {
    this.mw.push(cors())
    this.mw.push(morgan)
    this.mw.push(ContextProvider.getMiddleware({ headerName: 'X-Request-ID' }))
    this.mw.push(compression())
  }
}

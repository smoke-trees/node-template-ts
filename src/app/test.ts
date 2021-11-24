import { RequestHandler, Request, Response } from 'express'
import Application from '../core/app'
import Controller, { Route, Methods } from '../core/controller'
import log from '../core/log'

export default class TestController extends Controller {
  public path = '/';
  protected routes: Route[];
  protected controllers: Controller[];
  protected mw: RequestHandler[];

  constructor (app: Application) {
    super(app)
    this.routes = [
      {
        handler: this.indexHandler.bind(this),
        localMiddleware: [],
        method: Methods.GET,
        path: '/'
      }
    ]
    this.indexHandler.bind(this)
    this.controllers = []
    this.mw = []
  }

  async indexHandler (req: Request, res: Response): Promise<void> {
    log.info('Test', 'TestController.indexHandler')
    const value = await this.process()
    res.send(`Test ${value}`)
  }

  async process (): Promise<number> {
    return await this.newProcess()
  }

  async newProcess (): Promise<number> {
    log.info('Now it will take 2 sec', 'TestController.newProcess')
    return new Promise((resolve) => setTimeout(() => {
      log.info('Done', 'TestController.newProcess')
      resolve(2)
    }, 2000))
  }
}

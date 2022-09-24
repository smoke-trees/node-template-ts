import { Application, Controller, log, Methods, Route } from '@smoke-trees/postgres-backend';
import { Request, RequestHandler, Response } from 'express';

export default class TestController extends Controller {
  public path = '/';
  protected controllers: Controller[];
  protected mw: RequestHandler[];

  constructor(app: Application) {
    super(app)
    this.addRoutes({
      handler: this.indexHandler.bind(this),
      localMiddleware: [],
      method: Methods.GET,
      path: '/'
    })
    this.controllers = []
    this.mw = []
  }

  async indexHandler(req: Request, res: Response): Promise<void> {
    log.info('Test', 'TestController.indexHandler')
    const value = await this.process()
    res.send(`Test ${value}`)
  }

  async process(): Promise<number> {
    return await this.newProcess()
  }

  async newProcess(): Promise<number> {
    log.info('Now it will take 2 sec', 'TestController.newProcess')
    return new Promise((resolve) => setTimeout(() => {
      log.info('Done', 'TestController.newProcess')
      resolve(2)
    }, 2000))
  }
}

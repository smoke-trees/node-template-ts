import { RequestHandler, Router as ExpressRouter } from 'express'
export default abstract class Router {
  protected abstract mw: RequestHandler[];
  protected readonly router: ExpressRouter;
  constructor (router: ExpressRouter) {
    this.router = router
  }

  public loadMiddleware (): void {
    this.mw.forEach((mw) => {
      this.router.use(mw)
    })
  }

  protected setMiddleware (mw?: RequestHandler[]): void {
    this.mw = mw ?? []
  }
}

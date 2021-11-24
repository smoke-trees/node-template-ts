import { Router as ExpressRouter, Request, Response, NextFunction } from 'express'
import Application from './app'
import Router from './RouteHandler'

export const enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export interface Route {
  path: string;
  method: Methods;
  localMiddleware: ((req: Request, res: Response, next: NextFunction) => void)[];
  handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
}

export default abstract class Controller extends Router {
  // Router instance for mapping routes
  // The path on which this.routes will be mapped
  public abstract path: string;
  // Array of objects which implement IRoutes interface
  protected abstract readonly routes: Array<Route>;

  protected readonly app: Application;

  protected abstract controllers: Controller[];

  constructor (app: Application) {
    super(ExpressRouter())
    this.app = app
    this.setMiddleware()
    this.loadMiddleware()
  }

  public setRoutes = (): ExpressRouter => {
    // Set HTTP method, middleware, and handler for each route
    // Returns Router object, which we will use in Server class
    for (const route of this.routes) {
      for (const mw of route.localMiddleware) {
        this.router.use(route.path, mw)
      }
      switch (route.method) {
        case Methods.GET:
          this.router.get(route.path, route.handler)
          break
        case Methods.POST:
          this.router.post(route.path, route.handler)
          break
        case Methods.PUT:
          this.router.put(route.path, route.handler)
          break
        case Methods.DELETE:
          this.router.delete(route.path, route.handler)
          break
        default:
        // Throw exception
      }
    }
    for (const controllers of this.controllers) {
      this.router.use(controllers.path, controllers.setRoutes())
      // Throw exception
    }
    // Return router instance (will be usable in Server class)
    return this.router
  };
}

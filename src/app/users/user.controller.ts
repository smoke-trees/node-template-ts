import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import Application from "../../core/app";
import Controller from "../../core/controller";
import { ServiceController } from "../../core/ServiceController";
import { User } from "./user.entity";
import { UserService } from "./user.service";

export class UserController extends ServiceController<User>  {
  public path: string = '/user'
  protected controllers: Controller[];
  protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[];
  public service: UserService;
  constructor(app: Application, userService: UserService) {
    super(app, User, userService, { paths: { } });
    this.service = userService;
    this.controllers = [];
    this.mw = []
  }
}
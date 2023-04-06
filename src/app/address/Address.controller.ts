import { Application, Controller, ServiceController } from "@smoke-trees/postgres-backend";
import { Address } from "./Address.entity";
import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AddressService } from "./Address.service";

export class AddressController extends ServiceController<Address> {
  path: string = '/address';
  protected controllers: Controller[] = [];
  protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = [];


  service: AddressService

  constructor(app: Application, addressService: AddressService) {
    super(app, Address, addressService)

    this.service = addressService

    this.loadDocumentation()
  }
}

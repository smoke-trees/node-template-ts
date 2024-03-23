import {
  Application,
  Controller,
  ServiceController,
} from "@smoke-trees/postgres-backend";
import { RequestHandler } from "express";
import { Address } from "./Address.entity";
import { AddressService } from "./Address.service";

export class AddressController extends ServiceController<Address> {
  path: string = "/address";
  protected controllers: Controller[] = [];
  protected mw: RequestHandler[] = [];

  service: AddressService;

  constructor(app: Application, addressService: AddressService) {
    super(app, Address, addressService);

    this.service = addressService;

    this.loadDocumentation();
  }
}

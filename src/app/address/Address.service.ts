import { Service } from "@smoke-trees/postgres-backend";
import { Address } from "./Address.entity";
import { AddressDao } from "./Address.dao";

export class AddressService extends Service<Address> {

  dao: AddressDao

  constructor(dao: AddressDao) {
    super(dao)
    this.dao = dao
  }

}
import { Result, Service, WithCount } from "@smoke-trees/postgres-backend";
import { Address } from "./Address.entity";
import { AddressDao } from "./Address.dao";
import { QueryOption } from "@smoke-trees/postgres-backend/dist/core/Dao";

export class AddressService extends Service<Address> {
  dao: AddressDao;

  constructor(dao: AddressDao) {
    super(dao);
    this.dao = dao;
  }

  readMany(
    options: QueryOption<Address> = {}
  ): Promise<WithCount<Result<Address[]>>> {
    console.log(options);
    options = {
      ...options,
      dbOptions: {
        ...options.dbOptions,
        relations: ["user"],
      },
    };
    return super.readMany(options);
  }
}

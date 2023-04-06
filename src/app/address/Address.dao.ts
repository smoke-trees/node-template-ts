import { Dao, Database } from "@smoke-trees/postgres-backend";
import { Address } from "./Address.entity";

export class AddressDao extends Dao<Address> {

  constructor(database: Database) {
    super(database, Address, 'address')
  }

}

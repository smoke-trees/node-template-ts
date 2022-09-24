import { Dao, Database } from "@smoke-trees/postgres-backend";
import { User } from "./user.entity";

export class UserDao extends Dao<User> {
  constructor(database: Database) {
    super(database, User, "user");
  }
}
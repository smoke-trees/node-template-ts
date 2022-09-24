import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { User } from "./user.entity";

export class UserDao extends Dao<User> {
  constructor(database: Database) {
    super(database, User, "user");
  }
}
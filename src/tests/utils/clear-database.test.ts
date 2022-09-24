import Database from "../../core/database";
import { User } from "../../Example/users";

export function clearUserTable(database: Database) {
  return database.getConnection().getRepository(User).clear()
}
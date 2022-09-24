import { Database } from "@smoke-trees/postgres-backend";
import { User } from "../../Example/users";

export function clearUserTable(database: Database) {
  return database.getConnection().getRepository(User).clear()
}
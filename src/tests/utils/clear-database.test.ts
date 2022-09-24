import Database from "../../core/database";

export function clearUserTable(database: Database) {
  return database.getConnection().then((connection) => {
    return connection.getRepository("User").clear();
  });
}
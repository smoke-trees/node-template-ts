import { DataSource } from "typeorm";
import database from "./database";

const dataSource = new DataSource({
  ...database.getConfig(),
  synchronize: false,
  migrationsRun: true
});

export default dataSource;
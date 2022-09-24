import { DataSource, DataSourceOptions, EntitySchema, MixedList } from 'typeorm';
import log from './log';
import settings from './settings';
class Database {
  private _connection!: DataSource;
  public get connection(): DataSource {
    return this._connection;
  }
  private _ready: Promise<boolean>
  private entities: MixedList<Function | string | EntitySchema> = []
  private migrations: MixedList<Function | string> = []
  get ready(): Promise<boolean> {
    return this._ready
  }

  constructor(connect = false) {
    if (connect) {
      this._ready = this.connect()
    } else {
      this._ready = Promise.resolve(false)
    }
  }

  addEntity(...entity: (Function | string | EntitySchema)[]) {
    if (this.entities instanceof Array) {
      this.entities.push(...entity)
    }
  }
  addMigration(...entity: (Function | string)[]) {
    if (this.migrations instanceof Array) {
      this.migrations.push(...entity)
    }
  }

  async connect(): Promise<boolean> {
    console.log(this.getConfig())
    this._connection = new DataSource(this.getConfig())
    try {
      await this.connection.initialize()
      log.info("Database connected", 'database/connect')
      return true
    } catch (error) {
      log.error('Database connection error', 'database/connect', error, { config: this.getConfig() })
      return false
    }
  }

  getConnection(): DataSource {
    return this.connection
  }

  getConfig(): DataSourceOptions {
    const config: DataSourceOptions = {
      type: 'postgres',
      port: parseInt(settings.pgPort),
      name: settings.connectionName,
      database: settings.pgDatabase,
      host: settings.pgHost,
      username: settings.pgUser,
      password: settings.pgPassword,
      entities: this.entities,
      migrations: this.migrations,
      synchronize: settings.syncDatabase,
      migrationsRun: settings.runMigrations,
      logging: ['error', 'migration']
    }
    return config
  }
}

export default Database
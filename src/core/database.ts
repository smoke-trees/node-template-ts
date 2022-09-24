import { DataSource, DataSourceOptions, EntitySchema, MixedList } from 'typeorm';
import log from './log';
import { Settings } from './settings';
class Database {
  private _connection!: DataSource;
  public get connection(): DataSource {
    return this._connection;
  }
  private _ready: Promise<boolean>
  private entities: MixedList<Function | string | EntitySchema> = []
  private migrations: MixedList<Function | string> = []
  private settings: Settings
  get ready(): Promise<boolean> {
    return this._ready
  }

  constructor(settings: Settings, connect = false,) {
    this.settings = settings
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
      port: parseInt(this.settings.pgPort),
      name: this.settings.connectionName,
      database: this.settings.pgDatabase,
      host: this.settings.pgHost,
      username: this.settings.pgUser,
      password: this.settings.pgPassword,
      entities: this.entities,
      migrations: this.migrations,
      synchronize: this.settings.syncDatabase,
      migrationsRun: this.settings.runMigrations,
      logging: ['error', 'migration']
    }
    return config
  }
}

export default Database
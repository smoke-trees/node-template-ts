import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../app/users';
import log from './log';
import settings from './settings';

class Database {
  private connection!: DataSource;
  private _ready: Promise<boolean>

  get ready(): Promise<boolean> {
    return this._ready
  }

  constructor() {
    this._ready = this.connect()
  }

  async connect(): Promise<boolean> {
    this.connection = new DataSource(this.getConfig())
    try {
      await this.connection.initialize()
      log.info("Database connected", 'database/connect')
      return true
    } catch (error) {
      log.error('Database connection error', 'database/connect', error, { config: this.getConfig() })
      return false
    }
  }

  async getConnection(): Promise<DataSource> {
    if (!this.connection || !(await this.ready)) {
      throw new Error('Database not connected')
    }
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
      entities: [
        User
      ],
      synchronize: true,
      logging: ['error', 'migration']
    }
    return config
  }
}

export default Database
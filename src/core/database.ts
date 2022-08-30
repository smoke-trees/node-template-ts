import { DataSource, DataSourceOptions } from 'typeorm';
import log from './log';
import settings from './settings';

class Database {
  private connection!: DataSource;
  private connectionName: string | undefined;
  private _ready: Promise<boolean>

  get ready(): Promise<boolean> {
    return this._ready
  }

  constructor() {
    this.connectionName = settings.connectionName;
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
      port: 5432,
      name: this.connectionName,
      database: process.env.PGDATABASE ?? 'postgres',
      host: process.env.PGHOST ?? '172.17.0.1',
      username: process.env.PGUSER ?? 'postgres',
      password: process.env.PGPASSWORD ?? 'mysecretpassword',
      entities: [
      ],
      synchronize: true,
      logging: ['error', 'migration']
    }
    return config
  }
}

export default Database

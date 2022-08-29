import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm'
import Application from './app'
import path from 'path'
import settings from './settings'

class Database {
  private connection!: Connection;
  private connectionName: string | undefined;

  constructor(app: Application) {
    this.connectionName = settings.connectionName ;
    this.connect()
  }

  async connect(): Promise<void> {
    const connection = await createConnection(this.getConfig())
    this.connection = connection
    await connection.connect()
  }

  async getConnection(): Promise<Connection> {
    if (!this.connection) {
      throw new Error('Database not connected')
    }
    const client = getConnection(this.connectionName)
    return client
  }


  getConfig(): ConnectionOptions {

    const config: ConnectionOptions = {
      type: 'postgres',
      port: 5432,
      name: this.connectionName,
      database: process.env.PGDATABASE ?? 'postgres',
      host: process.env.PGHOST ?? '172.17.0.1',
      username: process.env.PGUSER ?? 'postgres',
      password: process.env.PGPASSWORD ?? 'mysecretpassword',
      entities: [
        path.join(__dirname, '/entity/*.js'),
      ],
      synchronize: true,
      logging: ['error', 'migration']
    }
    return config
  }
}

export default Database

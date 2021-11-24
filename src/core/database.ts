import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg'
import { Database as DatabaseInterface } from '../@types/database'
import Application from './app'
import log from './log'
import Settings from './settings'

class Database implements DatabaseInterface {
  public settings: Settings;
  private pool: Pool | undefined;

  constructor (app: Application) {
    this.settings = app.settings
  }

  connect (): void {
    const pool = new Pool(this.getConfig())

    pool.on('error', (err) => {
      log.error('Unexpected error on the database client', 'databaseConnection', { error: err.stack })
      // process.exit(-1)
    })

    pool.on('connect', () => {
      log.info('A new client to database connected', 'databaseClientConnected')
    })

    pool.on('remove', () => {
      log.info('A client from database has been removed', 'databaseClientRemoved')
    })
    this.pool = pool
  }

  async getClient (): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not connected')
    }
    const client = await this.pool.connect()
    return client
  }

  query (text: string, params?: any): Promise<QueryResult<any>> {
    if (!this.pool) {
      throw new Error('Database not connected')
    }
    return this.pool.query(text, params)
  }

  getConfig (): PoolConfig {
    const config: PoolConfig = {
      database: process.env.PGDATABASE ?? 'testdb',
      host: process.env.PGHOST ?? '172.0.0.1',
      user: process.env.PGUSER ?? 'testuser',
      password: process.env.PGPASSWORD ?? 'testpassword',
      log: (...messages) => { if (process.env.LOG_DATABASE === 'true') { log.debug(messages[0], 'Database', messages) } },
      connectionTimeoutMillis: 100000,
      query_timeout: 500000,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432
    }
    return config
  }
}

export default Database

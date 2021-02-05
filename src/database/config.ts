import { PoolConfig } from 'pg'
import log from '../log/log'

const config: PoolConfig = {
  database: process.env.PGDATABASE ?? 'testdb',
  host: process.env.PGHOST ?? '172.0.0.1',
  user: process.env.PGUSER ?? 'testuser',
  password: process.env.PGPASSWORD ?? 'testpassword',
  log: (...messages) => { if (process.env.LOG_DATBASE === 'true') { log.debug(messages) } },
  connectionTimeoutMillis: 100000,
  query_timeout: 500000,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432
}

export default config

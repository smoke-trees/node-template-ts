import { PoolConfig } from 'pg'
import log from '../log/log'

const config: PoolConfig = {
  database: process.env.PGDATABASE ?? 'db_name',
  host: process.env.PGHOST ?? 'db_host',
  user: process.env.PGUSER ?? 'db_user',
  password: process.env.PGPASSWORD ?? 'db_password',
  log: (...messages) => { if (process.env.LOG_DATBASE === 'true') { log.debug(messages) } },
  connectionTimeoutMillis: 100000,
  query_timeout: 500000,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432
}

export default config


import path from 'path'
import { ConnectionOptions } from 'typeorm'

const config: ConnectionOptions = {
  type: 'postgres',
  port: 5432,
  database: process.env.PGDATABASE ?? 'postgres',
  host: process.env.PGHOST ?? '172.17.0.1',
  username: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD ?? 'mysecretpassword',
  entities: [
    path.join(__dirname, '/entity/*.js')
  ],
  synchronize: true,
  logging: ['error', 'migration']
}

export default config

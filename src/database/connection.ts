import { Pool, PoolClient, QueryResult } from 'pg'
import log from '../log/log'
import config from './config'

const pool = new Pool(config)

pool.on('error', (err) => {
  log.error('Unexpected error on the database client', { functionName: 'databaseConnection', error: err.stack })
  // process.exit(-1)
})

pool.on('connect', () => {
  log.info('A new client to database connected', { functionName: 'databaseClientConnected' })
})

pool.on('remove', () => {
  log.info('A client from database has been removed', { funtionName: 'databaseClientRemoved' })
})

/* eslint  @typescript-eslint/no-explicit-any:"off" */
export const query = async (text: string, params?: any): Promise<QueryResult<any>> => {
  return pool.query(text, params)
}

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect()
  client.release()
  return client
}


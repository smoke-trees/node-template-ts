import { Database } from '../@types/database'
import { getClient, query } from './connection'

const Db: Database = {
  query,
  getClient
}

export default Db

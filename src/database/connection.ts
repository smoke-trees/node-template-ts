import mongodb, { Collection } from 'mongodb'
import { DatabaseObjectInterface } from '../@types/database'
import log from '../log/log'

const connectionString: string = process.env.CONNECTION_STRING ?? 'mongodb://localhost:27017'
const databaseName: string = process.env.DB_NAME ?? 'statedb'

const connect = async (): Promise<DatabaseObjectInterface> => {
  try {
    const connection = await mongodb.MongoClient.connect(connectionString)
    const db = connection.db(databaseName)
    log.info('Connected to mongo db sucessfully', { function: 'connect' })
    return {
      connection, db
    }
  } catch (error) {
    log.error('Error in connecting to mongo db', { function: 'connect mongo', error: error.stack })
    process.exit(1)
  }
}

const DatabaseObject = connect()

export default DatabaseObject

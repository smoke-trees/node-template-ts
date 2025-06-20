import { Database } from '@smoke-trees/postgres-backend'
import './config'
import settings from './settings'

const database = new Database(settings)

// Add Entities

// Add Migrations

export default database

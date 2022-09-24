import { Database } from '@smoke-trees/postgres-backend'
import './config'
import { User } from './Example/users'
import settings from './settings'

const database = new Database(settings)

// Add Entities

database.addEntity(User)

// Add Migrations

export default database
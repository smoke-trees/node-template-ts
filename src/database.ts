import { Database } from '@smoke-trees/postgres-backend'
import './config'
import { User } from './app/users'
import settings from './settings'
import { Address } from './app/address/Address.entity'

const database = new Database(settings)

// Add Entities

database.addEntity(User)
database.addEntity(Address)

// Add Migrations

export default database
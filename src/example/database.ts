import { Database } from '@smoke-trees/postgres-backend'
import '../config-env'
import settings from '../settings'
import { Address } from './app/address/Address.entity'
import { User } from './app/users'

const database = new Database(settings)

// Add Entities

database.addEntity(User)
database.addEntity(Address)

// Add Migrations

export default database

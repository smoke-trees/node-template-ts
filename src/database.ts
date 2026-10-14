import { Database } from '@smoke-trees/postgres-backend'
import { AclRule } from './app/aclRule/AclRule.entity'
import './config-env'
import settings from './settings'

const database = new Database(settings)

// Add Entities
database.addEntity(AclRule)

// Add Migrations

export default database

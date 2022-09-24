import './config'
import Database from './core/database'
import { Settings } from './core/settings'
import { User } from './Example/users'
import settings from './settings'

const database = new Database(settings)

// Add Entities

database.addEntity(User)

// Add Migrations

export default database
import './config'
import Database from './core/database'
import { User } from './Example/users'

const database = new Database()

// Add Entities

database.addEntity(User)

// Add Migrations

export default database
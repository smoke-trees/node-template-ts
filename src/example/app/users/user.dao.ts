import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { User } from './user.entity'

// Data access Object
export class UserDao extends Dao<User> {
	constructor(
		@inject('database')
		database: Database
	) {
		super(database, User, 'user')
	}
}

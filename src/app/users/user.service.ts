import { Service } from '@smoke-trees/postgres-backend'
import { UserDao } from './user.dao'
import { User } from './user.entity'

export class UserService extends Service<User> {
	dao: UserDao
	constructor(userDao: UserDao) {
		super(userDao)
		this.dao = userDao
	}
}

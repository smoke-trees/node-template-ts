import { Service } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { UserDao } from './user.dao'
import { User } from './user.entity'

export class UserService extends Service<User> {
	dao: UserDao
	constructor(
		@inject(UserDao)
		userDao: UserDao
	) {
		super(userDao)
		this.dao = userDao
	}
}

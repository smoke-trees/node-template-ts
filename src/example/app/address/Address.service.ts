import { Service } from '@smoke-trees/postgres-backend'
import { inject, LazyServiceIdentifier, postConstruct } from 'inversify'
import { UserService } from '../users'
import { AddressDao } from './Address.dao'
import { Address } from './Address.entity'

export class AddressService extends Service<Address> {
	dao: AddressDao

	@inject(UserService)
	userService!: UserService

	constructor(
		@inject(AddressDao)
		dao: AddressDao
	) {
		super(dao)
		this.dao = dao
	}

	@postConstruct()
	initUserService(@inject(new LazyServiceIdentifier(() => UserService)) userService: UserService) {
		this.userService = userService
	}
}

import { Result, Service, WithCount } from '@smoke-trees/postgres-backend'
import { QueryOption } from '@smoke-trees/postgres-backend/dist/core/Dao'
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

	readMany(options: QueryOption<Address> = {}): Promise<WithCount<Result<Address[]>>> {
		console.log(options)
		options = {
			...options,
			dbOptions: {
				...options.dbOptions,
				relations: ['user']
			}
		}
		return super.readMany(options)
	}
}

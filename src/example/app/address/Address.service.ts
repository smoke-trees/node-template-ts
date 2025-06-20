import { Result, Service, WithCount } from '@smoke-trees/postgres-backend'
import { QueryOption } from '@smoke-trees/postgres-backend/dist/core/Dao'
import { inject } from 'inversify'
import { AddressDao } from './Address.dao'
import { Address } from './Address.entity'

export class AddressService extends Service<Address> {
	dao: AddressDao

	constructor(
		@inject(AddressDao)
		dao: AddressDao
	) {
		super(dao)
		this.dao = dao
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

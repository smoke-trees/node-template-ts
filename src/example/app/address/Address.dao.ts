import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { Address } from './Address.entity'

export class AddressDao extends Dao<Address> {
	constructor(
		@inject('database')
		database: Database
	) {
		super(database, Address, 'address')
	}
}

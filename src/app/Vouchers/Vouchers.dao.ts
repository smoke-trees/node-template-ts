import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { Vouchers } from './Vouchers.entity'

export class VouchersDao extends Dao<Vouchers> {
	constructor(
		@inject('database')
		db: Database
	) {
		super(db, Vouchers, 'vouchers')
	}
}

import { Service } from '@smoke-trees/postgres-backend'
import { VouchersDao } from './Vouchers.dao'
import { Vouchers } from './Vouchers.entity'
import { inject } from 'inversify'

export class VouchersService extends Service<Vouchers> {
	dao: VouchersDao
	constructor(
		@inject(VouchersDao)
		dao: VouchersDao
	) {
		super(dao)
		this.dao = dao
	}
}

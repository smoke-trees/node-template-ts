import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { IVouchers } from './IVouchers'

@Documentation.addSchema({ type: 'object' })
@Entity({ name: 'vouchers' })
export class Vouchers extends BaseEntity implements IVouchers {
	@Documentation.addField({ type: 'string' })
	@PrimaryGeneratedColumn('uuid')
	id!: string

	constructor(data?: IVouchers) {
		super()
		if (data) {
			if (data.id) this.id = data.id
		}
	}
}

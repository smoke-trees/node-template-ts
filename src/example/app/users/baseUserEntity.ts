import { BaseEntity, Documentation, Validator } from '@smoke-trees/postgres-backend'
import { Column } from 'typeorm'
import { IUser } from './IUser'

// @Entity({ name: 'user_test_table' })
@Documentation.addSchema()
export class BaseUser extends BaseEntity {
	@Column('varchar', { name: 'name_user_1', length: 255, nullable: true })
	@Validator({ required: false, updatable: false })
	@Documentation.addField({
		type: 'string',
		minLength: 3,
		maxLength: 255,
		nullable: true
	})
	lastName!: string

	constructor(it?: IUser) {
		super()
		if (it) {
			this.lastName = it.lastName ?? ''
		}
	}
}

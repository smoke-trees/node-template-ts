import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IApplicationSettings, SettingTypes } from './IApplicationSettings'

@Documentation.addSchema()
@Entity({ name: 'application_settings' })
export class ApplicationSettings extends BaseEntity implements IApplicationSettings {
	@Documentation.addField({ type: 'string' })
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Documentation.addField({ type: 'string' })
	@Column({ type: 'varchar' })
	name!: string

	@Documentation.addField({ type: 'string' })
	@Column({ type: 'json' })
	value!: string

	@Documentation.addField({
		type: 'string',
		enum: Object.values(SettingTypes),
		default: SettingTypes.STRING
	})
	@Column({ type: 'enum', enum: SettingTypes, default: SettingTypes.STRING })
	type!: SettingTypes

	@Documentation.addField({ type: 'string' })
	@Column({ type: 'boolean', nullable: true, default: false })
	isPublic!: boolean

	constructor(data?: IApplicationSettings) {
		super()
		if (data) {
			if (data.id) this.id = data.id
			this.name = data.name
			this.value = data.value
			this.type = data.type
			this.isPublic = data.isPublic
		}
	}
}

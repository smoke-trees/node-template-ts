import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { IAppScreens } from './IAppScreens'

@Documentation.addSchema()
@Entity({ name: 'app_screens' })
@Index(['screenName', 'isActive'])
export class AppScreens extends BaseEntity implements IAppScreens {
	@Documentation.addField({ type: 'string' })
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'screen_name', type: 'varchar' })
	screenName!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'screen_json', type: 'varchar' })
	screenJson!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'json_version', type: 'varchar' })
	jsonVersion!: string

	@Documentation.addField({ type: 'boolean' })
	@Column({ name: 'is_active', type: 'boolean', default: false })
	isActive!: boolean

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'schedule_start_date', type: 'date', nullable: true })
	scheduleStartDate?: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'schedule_end_date', type: 'date', nullable: true })
	scheduleEndDate?: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'last_deployed', type: 'timestamp without time zone', nullable: true })
	lastDeployed!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'min_app_version', type: 'varchar' }) // TODO: remove nullable
	minAppVersion!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'max_app_version', type: 'varchar', nullable: true }) // TODO: remove nullable
	maxAppVersion?: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'version_note', type: 'varchar', nullable: true })
	versionNote?: string

	constructor(data?: IAppScreens) {
		super()
		if (data) {
			if (data.id) this.id = data.id
			this.screenName = data.screenName
			this.screenJson = data.screenJson
			this.jsonVersion = data.jsonVersion
			this.isActive = data.isActive
			this.scheduleStartDate = data.scheduleStartDate
			this.scheduleEndDate = data.scheduleEndDate
			this.lastDeployed = data.lastDeployed
			this.minAppVersion = data.minAppVersion
			this.maxAppVersion = data.maxAppVersion
			this.versionNote = data.versionNote
		}
	}
}

import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IAppScreens } from './IAppScreens'

@Documentation.addSchema()
@Entity({ name: 'app_screens' })
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

	@Documentation.addField({ type: 'number' })
	@Column({ name: 'version', type: 'float8' })
	version!: number

	@Documentation.addField({ type: 'boolean' })
	@Column({ name: 'is_latest', type: 'boolean', default: false })
	isLatest!: boolean

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
	@Column({ name: 'supported_app_version', type: 'varchar', nullable: true }) // TODO: remove nullable
	supportedAppVersion?: string

	constructor(data?: IAppScreens) {
		super()
		if (data) {
			if (data.id) this.id = data.id
			this.screenName = data.screenName
			this.screenJson = data.screenJson
			this.version = data.version
			this.isLatest = data.isLatest
			this.scheduleStartDate = data.scheduleStartDate
			this.scheduleEndDate = data.scheduleEndDate
			this.lastDeployed = data.lastDeployed
			this.supportedAppVersion = data.supportedAppVersion
		}
	}
}

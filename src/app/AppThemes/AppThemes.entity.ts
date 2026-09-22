import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IAppThemes } from './IAppThemes'

@Documentation.addSchema()
@Entity({ name: 'app_themes' })
export class AppThemes extends BaseEntity implements IAppThemes {
	@Documentation.addField({ type: 'string' })
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'theme_name', type: 'varchar' })
	themeName!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'theme_json', type: 'varchar' })
	themeJson!: string

	@Documentation.addField({ type: 'number' })
	@Column({ name: 'version', type: 'float8' })
	version!: number

	@Documentation.addField({ type: 'boolean' })
	@Column({ name: 'is_latest', type: 'boolean', default: false })
	isLatest!: boolean

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'schedule_start_date', type: 'timestamp without time zone', nullable: true })
	scheduleStartDate?: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'schedule_end_date', type: 'timestamp without time zone', nullable: true })
	scheduleEndDate?: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'last_deployed', type: 'timestamp without time zone', nullable: true })
	lastDeployed!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'supported_app_version', type: 'varchar', nullable: true }) // TODO: remove nullable
	supportedAppVersion?: string

	constructor(data?: IAppThemes) {
		super()
		if (data) {
			if (data.id) this.id = data.id
			this.themeName = data.themeName
			this.themeJson = data.themeJson
			this.version = data.version
			this.isLatest = data.isLatest
			this.scheduleStartDate = data.scheduleStartDate
			this.scheduleEndDate = data.scheduleEndDate
			this.lastDeployed = data.lastDeployed
		}
	}
}

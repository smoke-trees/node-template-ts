import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { IAppThemes } from './IAppThemes'

@Documentation.addSchema()
@Entity({ name: 'app_themes' })
@Index(['themeName', 'isActive'])
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

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'json_version', type: 'varchar' })
	jsonVersion!: string

	@Documentation.addField({ type: 'boolean' })
	@Column({ name: 'is_active', type: 'boolean', default: false })
	isActive!: boolean

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
	@Column({ name: 'min_app_version', type: 'varchar' }) // TODO: remove nullable
	minAppVersion!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'max_app_version', type: 'varchar', nullable: true }) // TODO: remove nullable
	maxAppVersion?: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'version_note', type: 'varchar', nullable: true })
	versionNote?: string

	constructor(data?: IAppThemes) {
		super()
		if (data) {
			if (data.id) this.id = data.id
			this.themeName = data.themeName
			this.themeJson = data.themeJson
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

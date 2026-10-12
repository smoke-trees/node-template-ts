import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { ApplicationSettings } from './ApplicationSettings.entity'

export class ApplicationSettingsDao extends Dao<ApplicationSettings> {
	constructor(
		@inject('database')
		db: Database
	) {
		super(db, ApplicationSettings, 'application_settings')
	}
}

import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { AppThemes } from './AppThemes.entity'

export class AppThemesDao extends Dao<AppThemes> {
	constructor(
		@inject('database')
		db: Database
	) {
		super(db, AppThemes, 'app_themes')
	}
}

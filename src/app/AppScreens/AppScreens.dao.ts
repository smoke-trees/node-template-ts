import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { AppScreens } from './AppScreens.entity'

export class AppScreensDao extends Dao<AppScreens> {
	constructor(
		@inject('database')
		db: Database
	) {
		super(db, AppScreens, 'app_screens')
	}
}

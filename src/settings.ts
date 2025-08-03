import { Settings } from '@smoke-trees/postgres-backend'
import './config-env'

export class ApplicationSettings extends Settings {
	databaseType: 'postgres' | 'mysql'
	dbPassword: string
	dbUser: string
	dbHost: string
	dbPort: string | undefined
	database: string

	constructor() {
		super()
		this.databaseType = 'postgres'
		this.dbPassword = this.getValue('PGPASSWORD', 'mysecretpassword')
		this.dbUser = this.getValue('PGUSER', 'postgres')
		this.dbHost = this.getValue('PGHOST', 'localhost')
		this.dbPort = this.getValue('PGPORT', '5432')
		this.database = this.getValue('PGDATABASE', 'postgres')
	}
}

const settings = new ApplicationSettings()

export default settings

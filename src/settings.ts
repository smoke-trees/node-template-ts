import { Settings } from '@smoke-trees/postgres-backend'
import './config-env'

export class ApplicationSettings extends Settings {
	databaseType: 'postgres' | 'mysql'
	dbPassword: string
	dbUser: string
	dbHost: string
	dbPort: string | undefined
	database: string
	valkeyHost: string
	valkeyPort: number
	valkeyDatabaseId: number
	valkeyPassword: string
	valkeyUsername: string
	aclSkippedRoutes: string[]

	constructor() {
		super()
		this.databaseType = 'postgres'
		this.dbPassword = this.getValue('PGPASSWORD', 'mysecretpassword')
		this.dbUser = this.getValue('PGUSER', 'postgres')
		this.dbHost = this.getValue('PGHOST', 'localhost')
		this.dbPort = this.getValue('PGPORT', '5432')
		this.database = this.getValue('PGDATABASE', 'postgres')
		this.valkeyHost = this.getValue('VALKEY_HOST', 'localhost')
		this.valkeyPort = parseInt(this.getValue('VALKEY_PORT', '6379'), 10)
		this.valkeyDatabaseId = parseInt(this.getValue('VALKEY_DATABASE_ID', '1'), 10)
		this.valkeyPassword = this.getValue('VALKEY_PASSWORD', '')
		this.valkeyUsername = this.getValue('VALKEY_USERNAME', '')
		this.aclSkippedRoutes = this.getValue('ACL_SKIPPED_ROUTES', '/docs*,/health')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	}
}

const settings = new ApplicationSettings()

export default settings

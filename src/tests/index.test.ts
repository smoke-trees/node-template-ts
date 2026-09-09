import { Database } from '@smoke-trees/postgres-backend'
import { log } from '../log'
import { container } from '../setup'
import { AclTestSuite } from './acl.test'

const database = container.get<Database>('database')
describe('Test Suite', function () {
	before(async function () {
		try {
			await database.connect()
			log.info(`Database ready: ${await database.ready}`, 'TestSuite.before', {})
		} catch (err) {
			log.warn('Database connection skipped or failed in test environment', 'TestSuite.before', {
				error: (err as Error).message
			})
		}
	})
	after(function () {})

	AclTestSuite()
})

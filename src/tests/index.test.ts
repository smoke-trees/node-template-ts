import { Database } from '@smoke-trees/postgres-backend'
import { container } from '../setup'

const database = container.get<Database>('database')
describe('Test Suite', function () {
	before(async function () {
		await database.connect()
		console.log(await database.ready)
	})
	after(function () {})
})

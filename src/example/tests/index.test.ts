import { Application, Database } from '@smoke-trees/postgres-backend'
import { container } from '../setup'
import { ExampleControllerTest } from './app/ExampleTests/controller.test'
import { ExampleServiceTest } from './app/ExampleTests/services.test'
import { clearUserTable } from './utils/clear-database.test'

const database = container.get<Database>('database')
const app = container.get(Application)

app.loadMiddleware()
app.loadControllers()

describe('Test Suite', function () {
	before(async function () {
		await database.connect()
		console.log(await database.ready)
		clearUserTable(database)
	})
	after(function () {})

	ExampleServiceTest()
	ExampleControllerTest()
})

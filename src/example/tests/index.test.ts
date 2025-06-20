import { Application, Database } from '@smoke-trees/postgres-backend'
import { ContextProvider } from '@smoke-trees/smoke-context'
import compression from 'compression'
import express from 'express'
import settings from '../../settings'
import { User, UserController, UserDao, UserService } from '../app/users'
import { ExampleControllerTest } from './app/ExampleTests/controller.test'
import { ExampleServiceTest } from './app/ExampleTests/services.test'
import { clearUserTable } from './utils/clear-database.test'

const database = new Database(settings)
database.addEntity(User)
const app = new Application(settings, database)

app.addMiddleWare(ContextProvider.getMiddleware({ headerName: 'X-Request-ID' }))
app.addMiddleWare(compression())
app.addMiddleWare(express.json({}))

const userDao = new UserDao(database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService)

app.addController(userController)

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

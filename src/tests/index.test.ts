import Application from "../core/app";
import Database from "../core/database";
import compression from 'compression'
import express from 'express'
import { ContextProvider } from '@smoke-trees/smoke-context'
import morgan from '../core/morgan'
import { User, UserController, UserDao, UserService } from "../Example/users";
import { ExampleControllerTest } from "./app/ExampleTests/controller.test";
import { ExampleServiceTest } from "./app/ExampleTests/services.test";
import { clearUserTable } from "./utils/clear-database.test";
import settings from "../settings";

const database = new Database(settings)
database.addEntity(User)
const app = new Application(settings, database)

app.addMiddleWare(morgan)
app.addMiddleWare(ContextProvider.getMiddleware({ headerName: 'X-Request-ID' }))
app.addMiddleWare(compression())
app.addMiddleWare(express.json({}))

const userDao = new UserDao(app.database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService);

app.addController(userController)

app.loadMiddleware()
app.loadControllers()


describe("Test Suite", function () {
  before(async function () {
    await database.connect()
    console.log(await database.ready)
    clearUserTable(app.database)
  });
  after(function () { });

  ExampleServiceTest(app.database, userService)
  ExampleControllerTest(app)
})
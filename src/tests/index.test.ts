import Application from "../core/app";
import Database from "../core/database";
import { User, UserController, UserDao, UserService } from "../Example/users";
import { ExampleControllerTest } from "./app/ExampleTests/controller.test";
import { ExampleServiceTest } from "./app/ExampleTests/services.test";
import { clearUserTable } from "./utils/clear-database.test";

const database = new Database()
database.addEntity(User)

const app = new Application(database)

const userDao = new UserDao(app.database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService);

app.addController(userController)

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
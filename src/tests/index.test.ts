import { UserController, UserDao, UserService } from "../app/users";
import Application from "../core/app";
import { ExampleControllerTest } from "./app/ExampleTests/contoller.test";
import { UserServiceTest } from "./app/ExampleTests/services.test";
import { clearUserTable } from "./utils/clear-database.test";

const app = new Application()

const userDao = new UserDao(app.database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService);

app.addController(userController)
app.loadControllers()



describe("Test Suite", function () {
  before(function () {
    clearUserTable(app.database)
  });
  after(function () { });

  UserServiceTest(app.database, userService)
  ExampleControllerTest(app)
})
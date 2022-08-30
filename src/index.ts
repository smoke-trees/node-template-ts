import { UserController, UserDoa, UserService } from './app/users'
import Application from './core/app'

const app = new Application()

///User Service
const userDao = new UserDoa(app.database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService)


app.addController(userController)

app.loadControllers()

app.run()

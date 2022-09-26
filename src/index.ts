import { Application, Documentation } from '@smoke-trees/postgres-backend'
import database from './database'
import { UserController, UserDao, UserService } from './Example/users'
import settings from './settings'

const app = new Application(settings, database)

const userDao = new UserDao(database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService)

app.addController(userController)

app.loadControllers()


Documentation.addServers([{
  url: 'http://localhost:8080',
  description: 'Local server'
}])

Documentation.addTags([{
  name: 'User',
  description: 'User related endpoints'
}])

Documentation.addInfo({
  title: 'Postgres Backend Template',
  description: 'This is a template for a postgres backend',
  version: '1.0.0'
})

console.log(JSON.stringify(Documentation.getAPIJson()))

app.run()

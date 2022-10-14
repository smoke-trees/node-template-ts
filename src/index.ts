import { Application, Documentation } from '@smoke-trees/postgres-backend'
import database from './database'
import { UserController, UserDao, UserService } from './app/users'
import settings from './settings'
import swaggerUiExpress from 'swagger-ui-express'
import cors from 'cors'
import { json } from 'express'

const app = new Application(settings, database)

const userDao = new UserDao(database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService)


app.addMiddleWare(cors())
app.addMiddleWare(json())

app.addController(userController)


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

//console.log(JSON.stringify(Documentation.getAPIJson()))
//

app.getApp().use('/docs', swaggerUiExpress.serveWithOptions({ cacheControl: true, maxAge: 64800 }))
app.getApp().get('/docs', swaggerUiExpress.setup(Documentation.getAPIJson()))

app.loadMiddleware()
app.loadControllers()

database.connect()

app.run()

import { Application, StLoggerMiddleware } from '@smoke-trees/postgres-backend'
import cors from 'cors'
import { json } from 'express'
import { Container } from 'inversify'
import database from './database'
import settings from './settings'

export const container: Container = new Container()

const app = new Application(settings, database)

app.getApp().set('query parser', 'extended')

container.bind('database').toConstantValue(database)
container.bind(Application).toConstantValue(app)

app.addMiddleWare(cors())
app.addMiddleWare(json())
app.addMiddleWare(StLoggerMiddleware({ setting: settings, stLoggerDao: app.stLoggerDao }))

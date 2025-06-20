import { Application } from '@smoke-trees/postgres-backend'
import cors from 'cors'
import { json } from 'express'
import { Container } from 'inversify'
import database from './database'
import settings from './settings'

export const container: Container = new Container()

const app = new Application(settings, database)

container.bind('database').toConstantValue(database)
container.bind(Application).toConstantValue(app)

app.addMiddleWare(cors())
app.addMiddleWare(json())

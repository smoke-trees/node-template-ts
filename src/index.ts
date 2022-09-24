import { Application } from '@smoke-trees/postgres-backend'
import database from './database'
import settings from './settings'

const app = new Application(settings, database)

app.loadControllers()

app.run()

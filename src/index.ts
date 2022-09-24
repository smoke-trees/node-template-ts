import Application from './core/app'
import database from './database'
import settings from './settings'

const app = new Application(settings, database)

app.loadControllers()

app.run()

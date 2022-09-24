import Application from './core/app'
import database from './database'

const app = new Application(database)

app.loadControllers()

app.run()

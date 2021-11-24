import TestController from './app/test'
import Application from './core/app'

const app = new Application()

app.addController(new TestController(app))

app.loadControllers()

app.run()

import { ConsultantService } from './app/Consultant/ConsultantService'
import { ConsumerService } from './app/Consumer/ConsumerService'
import { GeneratorService } from './app/Generator/GeneratorService'
import { UserService } from './app/User/UserService'
import ConsultantController from './controllers/consultant'
import ConsumerController from './controllers/consumer'
import GeneratorController from './controllers/generator'
import UserController from './controllers/user'
import Application from './core/app'

const app = new Application()

const userService = new UserService()
const userController = new UserController(app, userService)

const consumerService = new ConsumerService()
const consumerController = new ConsumerController(app, consumerService)

const consultantService = new ConsultantService()
const consultantController = new ConsultantController(app, consultantService)

const generatorService = new GeneratorService()
const generatorController = new GeneratorController(app, generatorService)

app.addController(userController)
app.addController(consumerController)
app.addController(consultantController)
app.addController(generatorController)

app.loadControllers()

app.run()

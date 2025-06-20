import { Application } from '@smoke-trees/postgres-backend'
import cors from 'cors'
import { json } from 'express'
import { Container } from 'inversify'
import settings from '../settings'
import { AddressController } from './app/address/Address.controller'
import { AddressDao } from './app/address/Address.dao'
import { AddressService } from './app/address/Address.service'
import { UserController, UserDao, UserService } from './app/users'
import database from './database'

export const container: Container = new Container()

const app = new Application(settings, database)

container.bind('database').toConstantValue(database)
container.bind(Application).toConstantValue(app)

container.bind(UserDao).toSelf()
container.bind(UserService).toSelf()
container.bind(UserController).toSelf()

container.bind(AddressDao).toSelf()
container.bind(AddressService).toSelf()
container.bind(AddressController).toSelf()

app.addMiddleWare(cors())
app.addMiddleWare(json())

app.addController(container.get(UserController))
app.addController(container.get(AddressController))

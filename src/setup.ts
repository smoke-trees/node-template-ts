import { Application } from '@smoke-trees/postgres-backend'
import { json } from 'express'
import { AddressController } from './app/address/Address.controller'
import { AddressDao } from './app/address/Address.dao'
import { AddressService } from './app/address/Address.service'
import { UserDao, UserService, UserController } from './app/users'
import database from './database'
import settings from './settings'
import cors from 'cors'

export const app = new Application(settings, database)

export const userDao = new UserDao(database)
export const userService = new UserService(userDao)
export const userController = new UserController(app, userService)

export const addressDao = new AddressDao(database)
export const addressService = new AddressService(addressDao)
export const addressController = new AddressController(app, addressService)

app.addMiddleWare(cors())
app.addMiddleWare(json())

app.addController(userController)
app.addController(addressController)

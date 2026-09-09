import { Application } from '@smoke-trees/postgres-backend'
import cors from 'cors'
import { json } from 'express'
import { Container } from 'inversify'
import { AclRuleController, AclRuleDao, AclRuleService, createAclMiddleware } from './app/aclRule'
import database from './database'
import settings from './settings'

export const container: Container = new Container()

const app = new Application(settings, database)

app.getApp().set('query parser', 'extended')

container.bind('database').toConstantValue(database)
container.bind(Application).toConstantValue(app)

container.bind(AclRuleDao).toSelf()
container.bind(AclRuleService).toSelf()
container.bind(AclRuleController).toSelf()

app.addMiddleWare(cors())
app.addMiddleWare(json())
app.addMiddleWare(createAclMiddleware(container.get(AclRuleService), settings.aclSkippedRoutes))

app.addController(container.get(AclRuleController))

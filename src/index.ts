import { Application, Documentation } from '@smoke-trees/postgres-backend'
import swaggerUiExpress from 'swagger-ui-express'
import { AclRuleService } from './app/aclRule'
import database from './database'
import { log } from './log'
import { container } from './setup'
import { valkeyService } from './utils/valkey.service'

Documentation.addServers([
	{
		url: 'http://localhost:8080',
		description: 'Local server'
	}
])

Documentation.addInfo({
	title: 'Postgres Backend Template',
	description: 'This is a template for a postgres backend',
	version: '1.0.0'
})

const app = container.get(Application)

app.getApp().use('/docs', swaggerUiExpress.serveWithOptions({ cacheControl: true, maxAge: 64800 }))
app.getApp().get('/docs', swaggerUiExpress.setup(Documentation.getAPIJson()))

app.loadMiddleware()
app.loadControllers()

async function start() {
	try {
		await database.connect()
		const aclRuleService = container.get(AclRuleService)
		await aclRuleService.loadRules()
	} catch (err) {
		log.error('Failed to initialize database or ACL rules', 'index.start', err as Error, {})
	}

	valkeyService.connect()
	await app.run()
}

start()

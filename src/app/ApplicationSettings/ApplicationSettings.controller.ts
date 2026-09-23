import { Application, Controller, ServiceController } from '@smoke-trees/postgres-backend'
import { RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { inject } from 'inversify'
import { ParsedQs } from 'qs'
import { ApplicationSettings } from './ApplicationSettings.entity'
import { ApplicationSettingsService } from './ApplicationSettings.service'

export class ApplicationSettingsController extends ServiceController<ApplicationSettings> {
	path: string = '/application-settings'
	protected controllers: Controller[] = []
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = []
	service: ApplicationSettingsService
	constructor(
		@inject(Application)
		app: Application,
		@inject(ApplicationSettingsService)
		service: ApplicationSettingsService
	) {
		super(app, ApplicationSettings, service)
		this.service = service
		this.addRoutes()
		this.loadDocumentation()
		this.loadMiddleware()
	}
}

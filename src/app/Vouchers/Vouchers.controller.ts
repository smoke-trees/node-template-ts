import { Application, Controller, ServiceController } from '@smoke-trees/postgres-backend'
import { Vouchers } from './Vouchers.entity'
import { RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { VouchersService } from './Vouchers.service'
import { inject } from 'inversify'

export class VouchersController extends ServiceController<Vouchers> {
	path: string = '/vouchers'
	protected controllers: Controller[] = []
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = []
	service: VouchersService
	constructor(
		@inject(Application)
		app: Application,
		@inject(VouchersService)
		service: VouchersService
	) {
		super(app, Vouchers, service)
		this.service = service
		this.addRoutes()
		this.loadDocumentation()
		this.loadMiddleware()
	}
}

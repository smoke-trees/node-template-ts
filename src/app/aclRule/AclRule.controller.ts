import {
	Application,
	Controller,
	Documentation,
	ErrorCode,
	Methods,
	Result,
	ServiceController
} from '@smoke-trees/postgres-backend'
import { Request, RequestHandler, Response } from 'express'
import { inject, injectable } from 'inversify'
import { log } from '../../log'
import { AclRule } from './AclRule.entity'
import { AclRuleService } from './AclRule.service'

@injectable()
export class AclRuleController extends ServiceController<AclRule> {
	//TODO: Add Middleware for this to be admin only
	public path: string = '/acl-rule'
	protected controllers: Controller[]
	protected mw: RequestHandler[]
	declare public service: AclRuleService

	constructor(
		@inject(Application) app: Application,
		@inject(AclRuleService) aclRuleService: AclRuleService
	) {
		super(app, AclRule, aclRuleService)
		this.service = aclRuleService
		this.controllers = []
		this.mw = []
		this.addRoutes({
			path: '/refresh',
			method: Methods.POST,
			localMiddleware: [],
			handler: this.refresh.bind(this)
		})
		this.loadDocumentation()
	}

	@Documentation.addRoute({
		path: '/acl-rule/refresh',
		method: Methods.POST,
		description: 'Reload ACL rules from database into memory',
		summary: 'Refresh ACL rules in-memory cache',
		responses: {
			200: {
				description: 'Success',
				value: { $ref: Documentation.getRef(Result) }
			},
			500: {
				description: 'Internal Server Error',
				value: { $ref: Documentation.getRef(Result) }
			}
		}
	})
	async refresh(_req: Request, res: Response): Promise<void> {
		try {
			const result = await this.service.refreshRules()
			res.status(result.getStatus()).json(result)
		} catch (error) {
			log.error('Failed to refresh ACL rules', 'AclRuleController.refresh', error as Error, {})
			res
				.status(500)
				.json(new Result(true, ErrorCode.InternalServerError, 'Failed to refresh ACL rules', null))
		}
	}
}

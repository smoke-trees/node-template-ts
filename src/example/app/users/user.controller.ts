import {
	Application,
	Controller,
	Documentation,
	Methods,
	ServiceController
} from '@smoke-trees/postgres-backend'
import { RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { inject, injectable } from 'inversify'
import { ParsedQs } from 'qs'
import { User } from './user.entity'
import { UserService } from './user.service'

@injectable()
export class UserController extends ServiceController<User> {
	public path: string = '/user'
	protected controllers: Controller[]
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[]
	public service: UserService
	constructor(
		@inject(Application) app: Application,
		@inject(UserService) userService: UserService
	) {
		super(app, User, userService)
		this.service = userService
		this.controllers = []
		this.mw = []
		this.loadDocumentation()
	}

	@Documentation.addRoute({
		path: '/user',
		method: Methods.POST,
		description: '123',
		summary: 'Get all users',
		requestBody: { $ref: Documentation.getRef(User) },
		responses: {
			200: {
				description: 'Success',
				value: { $ref: Documentation.getRef(User) }
			}
		}
	})
	public handleException1() {}
}

import {
	Application,
	Controller,
	Documentation,
	ErrorCode,
	Methods,
	Result,
	ServiceController
} from '@smoke-trees/postgres-backend'
import compression from 'compression'
import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { inject } from 'inversify'
import { ParsedQs } from 'qs'
import { AppThemes } from './AppThemes.entity'
import { AppThemesService } from './AppThemes.service'

export class AppThemesController extends ServiceController<AppThemes> {
	path: string = '/app-themes'
	protected controllers: Controller[] = []
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = []
	service: AppThemesService
	constructor(
		@inject(Application)
		app: Application,
		@inject(AppThemesService)
		service: AppThemesService
	) {
		super(
			app,
			AppThemes,
			service,
			{
				paths: {
					create: false,
					read: true,
					update: false
				}
			},
			{
				read: [
					compression()
					// TODO: App routes auth
				],
				readMany: [
					compression()
					// TODO: App routes auth
				]
			}
		)
		this.service = service
		this.addRoutes(
			{
				handler: this.deployTheme.bind(this),
				method: Methods.POST,
				path: '/deploy',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.scheduleDeployTheme.bind(this),
				method: Methods.POST,
				path: '/schedule-deploy',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.revertTheme.bind(this),
				method: Methods.POST,
				path: '/revert',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.scheduleCron.bind(this),
				method: Methods.POST,
				path: '/schedule-cron',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.getLatestTheme.bind(this),
				method: Methods.GET,
				path: '/get-latest',
				localMiddleware: [
					// TODO: App routes auth
				]
			}
		)
		this.loadDocumentation()
		this.loadMiddleware()
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/app-themes/deploy',
		description: 'Deploy a new theme',
		requestBody: {
			type: 'object',
			properties: {
				themeName: {
					type: 'string'
				},
				themeJson: {
					type: 'string'
				},
				appVersion: {
					type: 'string'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Theme Deployed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async deployTheme(req: Request, res: Response) {
		const { themeName, themeJson, appVersion } = req.body
		if (!themeName || !themeJson || !appVersion) {
			res
				.status(400)
				.json(
					new Result(true, ErrorCode.BadRequest, 'themeName, themeJson and appVersion are required')
				)
			return
		}
		const result = await this.service.deployTheme(themeName, themeJson, appVersion)
		res.status(200).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/app-themes/schedule-deploy',
		description: 'Schedule a new theme',
		requestBody: {
			type: 'object',
			properties: {
				themeName: {
					type: 'string'
				},
				themeJson: {
					type: 'string'
				},
				scheduleStartDate: {
					type: 'string'
				},
				scheduleEndDate: {
					type: 'string'
				},
				makeLatest: {
					type: 'boolean'
				},
				appVersion: {
					type: 'string'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Theme Deployed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async scheduleDeployTheme(req: Request, res: Response) {
		const { themeName, themeJson, scheduleStartDate, scheduleEndDate, makeLatest, appVersion } =
			req.body
		if (!themeName || !themeJson || !scheduleStartDate || !scheduleEndDate || !appVersion) {
			res
				.status(400)
				.json(
					new Result(
						true,
						ErrorCode.BadRequest,
						'themeName, themeJson, scheduleStartDate, scheduleEndDate and appVersion are required'
					)
				)
			return
		}
		const result = await this.service.scheduleDeployTheme(
			themeName,
			themeJson,
			scheduleStartDate,
			scheduleEndDate,
			makeLatest,
			appVersion
		)
		res.status(200).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/app-themes/revert',
		description: 'Revert to latest version',
		requestBody: {
			type: 'object',
			properties: {
				themeName: {
					type: 'string'
				},
				version: {
					type: 'number'
				},
				appVersion: {
					type: 'string'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Theme Reverted',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async revertTheme(req: Request, res: Response) {
		const { themeName, version, appVersion } = req.body
		if (!themeName || !appVersion) {
			res
				.status(400)
				.json(new Result(true, ErrorCode.BadRequest, 'themeName and appVersion are required'))
			return
		}
		const result = await this.service.revertLatest(themeName, appVersion, version)
		res.status(200).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/app-themes/schedule-cron',
		description: 'Run the schedule cron for themes (activate due schedules, expire ended ones)',
		requestBody: {
			type: 'object',
			properties: {
				date: {
					type: 'string'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Schedule Cron Completed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async scheduleCron(req: Request, res: Response) {
		const { date } = req.body ?? {}
		const activated = await this.service.activateScheduled(date)
		const expired = await this.service.expireScheduled(date)
		const hasError = activated.status.error || expired.status.error
		res
			.status(200)
			.json(
				new Result(
					hasError,
					hasError ? ErrorCode.InternalServerError : ErrorCode.Success,
					'Schedule cron completed',
					{ activated: activated.result, expired: expired.result }
				)
			)
	}

	@Documentation.addRoute({
		method: Methods.GET,
		path: '/app-themes/get-latest',
		description: 'Get the latest version of a theme',
		parameters: [
			{
				name: 'themeName',
				in: 'query',
				required: true,
				schema: {
					type: 'string'
				}
			},
			{
				name: 'appVersion',
				in: 'query',
				required: true,
				schema: {
					type: 'string'
				}
			}
		],
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Screen Reverted',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async getLatestTheme(req: Request, res: Response) {
		const { themeName, appVersion } = req.query
		if (!themeName || !appVersion) {
			res
				.status(400)
				.json(new Result(true, ErrorCode.BadRequest, 'themeName and appVersion are required'))
			return
		}
		const result = await this.service.getLatestTheme(themeName.toString(), appVersion.toString())
		res.status(result.getStatus()).json(result)
	}
}

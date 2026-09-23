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
				handler: this.activateJson.bind(this),
				method: Methods.POST,
				path: '/activate-json',
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
				jsonVersion: {
					type: 'string'
				},
				minAppVersion: {
					type: 'string'
				},
				maxAppVersion: {
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
		const { themeName, themeJson, jsonVersion, minAppVersion, maxAppVersion, appVersion } = req.body
		const minVersion = minAppVersion ?? appVersion
		if (!themeName || !themeJson || !jsonVersion || !minVersion) {
			res
				.status(400)
				.json(
					new Result(
						true,
						ErrorCode.BadRequest,
						'themeName, themeJson, jsonVersion and minAppVersion (or appVersion) are required'
					)
				)
			return
		}
		const result = await this.service.deployTheme(
			themeName,
			themeJson,
			jsonVersion,
			minVersion,
			maxAppVersion
		)
		res.status(result.getStatus()).json(result)
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
				jsonVersion: {
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
				minAppVersion: {
					type: 'string'
				},
				maxAppVersion: {
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
	async scheduleDeployTheme(req: Request, res: Response) {
		const {
			themeName,
			themeJson,
			jsonVersion,
			scheduleStartDate,
			scheduleEndDate,
			makeLatest,
			minAppVersion,
			maxAppVersion,
			appVersion
		} = req.body
		const minVersion = minAppVersion ?? appVersion

		if (
			!themeName ||
			!themeJson ||
			!jsonVersion ||
			!minVersion ||
			!scheduleStartDate ||
			!scheduleEndDate
		) {
			res
				.status(400)
				.json(
					new Result(
						true,
						ErrorCode.BadRequest,
						'themeName, themeJson, jsonVersion, minAppVersion (or appVersion), scheduleStartDate and scheduleEndDate are required'
					)
				)
			return
		}

		const result = await this.service.scheduleDeployTheme(
			themeName,
			themeJson,
			jsonVersion,
			scheduleStartDate,
			scheduleEndDate,
			minVersion,
			makeLatest ?? false,
			maxAppVersion
		)
		res.status(result.getStatus()).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/app-themes/activate-json',
		description: 'Activate a theme json by id',
		requestBody: {
			type: 'object',
			properties: {
				id: {
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
	async activateJson(req: Request, res: Response) {
		const { id } = req.body

		if (!id) {
			res.status(400).json(new Result(true, ErrorCode.BadRequest, 'id is required'))
			return
		}

		const result = await this.service.activateJson(id)
		res.status(result.getStatus()).json(result)
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
		method: Methods.POST,
		path: '/app-themes/schedule-cron/activate',
		description: 'Testing route: send a date, schedules active on it become isLatest',
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
				description: 'Scheduled Themes Activated',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async activateCron(req: Request, res: Response) {
		const { date } = req.body ?? {}
		const result = await this.service.activateScheduled(date)
		res.status(result.getStatus()).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/app-themes/schedule-cron/expire',
		description: 'Testing route: send a date, schedules ended before it lose isLatest',
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
				description: 'Expired Schedules Cleared',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async expireCron(req: Request, res: Response) {
		const { date } = req.body ?? {}
		const result = await this.service.expireScheduled(date)
		res.status(result.getStatus()).json(result)
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
				description: 'Theme Reverted',
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

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
import { AppScreens } from './AppScreens.entity'
import { AppScreensService } from './AppScreens.service'

export class AppScreensController extends ServiceController<AppScreens> {
	path: string = '/app-screens'
	protected controllers: Controller[] = []
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = []
	service: AppScreensService
	constructor(
		@inject(Application)
		app: Application,
		@inject(AppScreensService)
		service: AppScreensService
	) {
		super(
			app,
			AppScreens,
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
				handler: this.deployScreen.bind(this),
				method: Methods.POST,
				path: '/deploy',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.scheduleDeployScreen.bind(this),
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
				handler: this.getLatestScreen.bind(this),
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
		path: '/app-screens/deploy',
		description: 'Deploy a new screen',
		requestBody: {
			type: 'object',
			properties: {
				screenName: {
					type: 'string'
				},
				screenJson: {
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
				description: 'Screen Deployed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async deployScreen(req: Request, res: Response) {
		const { screenName, screenJson, jsonVersion, minAppVersion, maxAppVersion, appVersion } =
			req.body
		const minVersion = minAppVersion ?? appVersion
		if (!screenName || !screenJson || !jsonVersion || !minVersion) {
			res
				.status(400)
				.json(
					new Result(
						true,
						ErrorCode.BadRequest,
						'screenName, screenJson, jsonVersion and minAppVersion (or appVersion) are required'
					)
				)
			return
		}
		const result = await this.service.deployScreen(
			screenName,
			screenJson,
			jsonVersion,
			minVersion,
			maxAppVersion
		)
		res.status(result.getStatus()).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/app-screens/schedule-deploy',
		description: 'Schedule a new screen',
		requestBody: {
			type: 'object',
			properties: {
				screenName: {
					type: 'string'
				},
				screenJson: {
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
				description: 'Screen Deployed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async scheduleDeployScreen(req: Request, res: Response) {
		const {
			screenName,
			screenJson,
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
			!screenName ||
			!screenJson ||
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
						'screenName, screenJson, jsonVersion, minAppVersion (or appVersion), scheduleStartDate and scheduleEndDate are required'
					)
				)
			return
		}

		const result = await this.service.scheduleDeployScreen(
			screenName,
			screenJson,
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
		path: '/app-screens/revert',
		description: 'Revert to latest version',
		requestBody: {
			type: 'object',
			properties: {
				screenName: {
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
				description: 'Screen Reverted',
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
		path: '/app-screens/schedule-cron',
		description: 'Run the schedule cron for screens (activate due schedules, expire ended ones)',
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
		path: '/app-screens/schedule-cron/activate',
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
				description: 'Scheduled Screens Activated',
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
		path: '/app-screens/schedule-cron/expire',
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
		path: '/app-screens/get-latest',
		description: 'Get the latest version of a screen',
		parameters: [
			{
				name: 'screenName',
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
	async getLatestScreen(req: Request, res: Response) {
		const { screenName, appVersion } = req.query
		if (!screenName || !appVersion) {
			res
				.status(400)
				.json(new Result(true, ErrorCode.BadRequest, 'screenName and appVersion are required'))
			return
		}
		const result = await this.service.getLatestScreen(screenName.toString(), appVersion.toString())
		res.status(result.getStatus()).json(result)
	}
}

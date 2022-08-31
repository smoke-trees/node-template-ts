import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { ConsumerService } from '../app/Consumer/ConsumerService'
import Application from '../core/app'
import Controller, { Methods, Route } from '../core/controller'
import log from '../core/log'
import { getStatus } from '../utils/response'

export default class ConsumerController extends Controller {
    public path: string = '/consumer'
    protected routes: Route[]
    protected controllers: Controller[]
    protected mw: RequestHandler<
        ParamsDictionary,
        any,
        any,
        ParsedQs,
        Record<string, any>
    >[]
    protected consumerService: ConsumerService
    constructor(app: Application, consumerService: ConsumerService) {
        super(app)
        this.mw = []
        this.controllers = []
        this.consumerService = consumerService
        this.routes = [
            {
                method: Methods.GET,
                path: '/',
                localMiddleware: [],
                handler: this.getConsumer.bind(this),
            },
            {
                method: Methods.POST,
                path: '/',
                localMiddleware: [],
                handler: this.createConsumer.bind(this),
            },
            {
                method: Methods.PUT,
                path: '/',
                localMiddleware: [],
                handler: this.editConsumer.bind(this),
            },
            {
                method: Methods.DELETE,
                path: '/',
                localMiddleware: [],
                handler: this.deleteConsumer.bind(this),
            },
        ]
    }

    async getConsumer(req: Request, res: Response) {
        const { consumerId } = req.query
        log.debug("Read consumer route", 'getConsumer', { consumerId })
        if (consumerId === '' || consumerId === undefined) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        else {
            const result = await this.consumerService.getConsumer(
                consumerId?.toString(),
            )
            const formatedResult = {
                error: result.error.error,
                code: result.error.code,
                message: result.message,
                consumer: result.result
            }
            res.status(getStatus(result)).json(formatedResult)
        }
    }

    async deleteConsumer(req: Request, res: Response) {
        const { consumerId } = req.query
        if (consumerId === '' || consumerId === undefined) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        } else {
            const result = await this.consumerService.deleteConsumer(
                consumerId.toString()
            )
            const formatedResult = {
                error: result.error.error,
                code: result.error.code,
                message: result.message,
            }

            res.status(getStatus(result)).json(formatedResult)
        }
    }

    async createConsumer(req: Request, res: Response) {
        const consumer = req.body
        if (
            consumer.name === '' ||
            consumer.name === undefined ||
            consumer.quantumConsumed === '' ||
            consumer.quantumConsumed === undefined
        ) {
            res.status(400).json({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        const result = await this.consumerService.createConsumer(consumer)
        const formatedResult = {
            error: result.error.error,
            code: result.error.code,
            message: result.message,
            id: result.result
        }
        res.status(getStatus(result)).json(formatedResult)
    }

    async editConsumer(req: Request, res: Response) {
        const consumer = req.body
        if (
            consumer.id === '' ||
            consumer.id === undefined
        ) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        const result = await this.consumerService.updateConsumer(consumer)
        const formattedResult = {
            error: result?.error.error,
            message: result?.message,
            code: result?.error.code
        }
        if (result?.error.error) {
            res.status(500).send(formattedResult)
        } else {
            res.status(200).send(formattedResult)
        }
    }
}

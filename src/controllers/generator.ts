import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { GeneratorService } from '../app/Generator/GeneratorService'
import Application from '../core/app'
import Controller, { Methods, Route } from '../core/controller'
import log from '../core/log'
import { getStatus } from '../utils/response'

export default class GeneratorController extends Controller {
    public path: string = '/generator'
    protected routes: Route[]
    protected controllers: Controller[]
    protected mw: RequestHandler<
        ParamsDictionary,
        any,
        any,
        ParsedQs,
        Record<string, any>
    >[]
    protected generatorService: GeneratorService
    constructor(app: Application, generatorService: GeneratorService) {
        super(app)
        this.mw = []
        this.controllers = []
        this.generatorService = generatorService
        this.routes = [
            {
                method: Methods.GET,
                path: '/',
                localMiddleware: [],
                handler: this.getGenerator.bind(this),
            },
            {
                method: Methods.POST,
                path: '/',
                localMiddleware: [],
                handler: this.createGenerator.bind(this),
            },
            {
                method: Methods.PUT,
                path: '/',
                localMiddleware: [],
                handler: this.editGenerator.bind(this),
            },
            {
                method: Methods.DELETE,
                path: '/',
                localMiddleware: [],
                handler: this.deleteGenerator.bind(this),
            },
        ]
    }

    async getGenerator(req: Request, res: Response) {
        const { generatorId } = req.query
        log.debug("Read generator route", 'getGenerator', { generatorId })
        if (generatorId === '' || generatorId === undefined) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        else {
            const result = await this.generatorService.getGenerator(
                generatorId?.toString(),
            )
            const formatedResult = {
                error: result.error.error,
                code: result.error.code,
                message: result.message,
                generator: result.result
            }
            res.status(getStatus(result)).json(formatedResult)
        }
    }

    async deleteGenerator(req: Request, res: Response) {
        const { generatorId } = req.query
        if (generatorId === '' || generatorId === undefined) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        } else {
            const result = await this.generatorService.deleteGenerator(
                generatorId.toString()
            )
            const formatedResult = {
                error: result.error.error,
                code: result.error.code,
                message: result.message,
            }

            res.status(getStatus(result)).json(formatedResult)
        }
    }

    async createGenerator(req: Request, res: Response) {
        const generator = req.body
        if (
            generator.name === '' ||
            generator.name === undefined ||
            generator.quantumGenerated === '' ||
            generator.quantumGenerated === undefined
        ) {
            res.status(400).json({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        const result = await this.generatorService.createGenerator(generator)
        const formatedResult = {
            error: result.error.error,
            code: result.error.code,
            message: result.message,
            id: result.result
        }
        res.status(getStatus(result)).json(formatedResult)
    }

    async editGenerator(req: Request, res: Response) {
        const generator = req.body
        if (
            generator.id === '' ||
            generator.id === undefined
        ) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        const result = await this.generatorService.updateGenerator(generator)
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

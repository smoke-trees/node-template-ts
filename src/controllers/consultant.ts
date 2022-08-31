import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { ConsultantService } from '../app/Consultant/ConsultantService'
import Application from '../core/app'
import Controller, { Methods, Route } from '../core/controller'
import log from '../core/log'
import { getStatus } from '../utils/response'

export default class ConsultantController extends Controller {
    public path: string = '/consultant'
    protected routes: Route[]
    protected controllers: Controller[]
    protected mw: RequestHandler<
        ParamsDictionary,
        any,
        any,
        ParsedQs,
        Record<string, any>
    >[]
    protected consultantService: ConsultantService
    constructor(app: Application, consultantService: ConsultantService) {
        super(app)
        this.mw = []
        this.controllers = []
        this.consultantService = consultantService
        this.routes = [
            {
                method: Methods.GET,
                path: '/',
                localMiddleware: [],
                handler: this.getConsultant.bind(this),
            },
            {
                method: Methods.POST,
                path: '/',
                localMiddleware: [],
                handler: this.createConsultant.bind(this),
            },
            {
                method: Methods.PUT,
                path: '/',
                localMiddleware: [],
                handler: this.editConsultant.bind(this),
            },
            {
                method: Methods.DELETE,
                path: '/',
                localMiddleware: [],
                handler: this.deleteConsultant.bind(this),
            },
        ]
    }

    async getConsultant(req: Request, res: Response) {
        const { consultantId } = req.query
        log.debug("Read consultant route", 'getConsultant', { consultantId })
        if (consultantId === '' || consultantId === undefined) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        else {
            const result = await this.consultantService.getConsultant(
                consultantId?.toString(),
            )
            const formatedResult = {
                error: result.error.error,
                code: result.error.code,
                message: result.message,
                consultant: result.result
            }
            res.status(getStatus(result)).json(formatedResult)
        }
    }

    async deleteConsultant(req: Request, res: Response) {
        const { consultantId } = req.query
        if (consultantId === '' || consultantId === undefined) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        } else {
            const result = await this.consultantService.deleteConsultant(
                consultantId.toString()
            )
            const formatedResult = {
                error: result.error.error,
                code: result.error.code,
                message: result.message,
            }

            res.status(getStatus(result)).json(formatedResult)
        }
    }

    async createConsultant(req: Request, res: Response) {
        const consultant = req.body
        if (
            consultant.name === '' ||
            consultant.name === undefined
        ) {
            res.status(400).json({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        const result = await this.consultantService.createConsultant(consultant)
        const formatedResult = {
            error: result.error.error,
            code: result.error.code,
            message: result.message,
            id: result.result
        }
        res.status(getStatus(result)).json(formatedResult)
    }

    async editConsultant(req: Request, res: Response) {
        const consultant = req.body
        if (
            consultant.id === '' ||
            consultant.id === undefined
        ) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        const result = await this.consultantService.updateConsultant(consultant)
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

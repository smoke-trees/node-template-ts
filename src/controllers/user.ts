import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { UserService } from '../app/User/UserService'
import Application from '../core/app'
import Controller, { Methods, Route } from '../core/controller'
import log from '../core/log'
import { getStatus } from '../utils/response'

export default class UserController extends Controller {
    public path: string = '/user'
    protected routes: Route[]
    protected controllers: Controller[]
    protected mw: RequestHandler<
        ParamsDictionary,
        any,
        any,
        ParsedQs,
        Record<string, any>
    >[]
    protected userService: UserService
    constructor(app: Application, userService: UserService) {
        super(app)
        this.mw = []
        this.controllers = []
        this.userService = userService
        this.routes = [
            {
                method: Methods.GET,
                path: '/',
                localMiddleware: [],
                handler: this.getUser.bind(this),
            },
            {
                method: Methods.POST,
                path: '/',
                localMiddleware: [],
                handler: this.createUser.bind(this),
            },
            {
                method: Methods.PUT,
                path: '/',
                localMiddleware: [],
                handler: this.editUser.bind(this),
            },
            {
                method: Methods.DELETE,
                path: '/',
                localMiddleware: [],
                handler: this.deleteUser.bind(this),
            },
        ]
    }

    async getUser(req: Request, res: Response) {
        const { userId } = req.query
        log.debug("Read user route", 'getUser', { userId })
        if (userId === '' || userId === undefined) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        else {
            const result = await this.userService.getUser(
                userId?.toString(),
            )
            const formatedResult = {
                error: result.error.error,
                code: result.error.code,
                message: result.message,
                user: result.result
            }
            res.status(getStatus(result)).json(formatedResult)
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { userId } = req.query
        if (userId === '' || userId === undefined) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        } else {
            const result = await this.userService.deleteUser(
                userId.toString()
            )
            const formatedResult = {
                error: result.error.error,
                code: result.error.code,
                message: result.message,
            }

            res.status(getStatus(result)).json(formatedResult)
        }
    }

    async createUser(req: Request, res: Response) {
        const user = req.body
        if (
            user.email === '' ||
            user.email === undefined ||
            user.name === '' ||
            user.name === undefined
        ) {
            res.status(400).json({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        const result = await this.userService.createUser(user)
        const formatedResult = {
            error: result.error.error,
            code: result.error.code,
            message: result.message,
            id: result.result
        }
        res.status(getStatus(result)).json(formatedResult)
    }

    async editUser(req: Request, res: Response) {
        const user = req.body
        if (
            user.id === '' ||
            user.id === undefined 
        ) {
            res.status(400).send({
                error: true,
                message: 'Request parameter missing',
                status: 400,
            })
            return
        }
        const result = await this.userService.updateUser(user)
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

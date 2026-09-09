import { ErrorCode, Result } from '@smoke-trees/postgres-backend'
import { NextFunction, Request, Response } from 'express'
import { log } from '../../log'
import settings from '../../settings'
import { isAllowed, matchesPath } from './acl.engine'
import { AclRuleService } from './AclRule.service'

export function createAclMiddleware(
	aclRuleService: AclRuleService,
	skippedRoutes: string[] = settings.aclSkippedRoutes
) {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			const path = req.path

			const isSkipped = skippedRoutes.some((routePattern) => matchesPath(routePattern, path))
			if (isSkipped) {
				return next()
			}

			const forwardedFor = req.headers['x-forwarded-for']
			const rawIp =
				typeof forwardedFor === 'string' ? (forwardedFor.split(',')[0]?.trim() ?? '')
				: Array.isArray(forwardedFor) ? (forwardedFor[0]?.trim() ?? '')
				: (req.socket?.remoteAddress ?? '')

			const ua = (req.headers['user-agent'] as string | undefined) ?? ''

			const rules = aclRuleService.getCompiledRules()
			const decision = isAllowed(rules, rawIp, ua, path)

			if (decision === 'block') {
				log.warn('Request blocked by ACL rule', 'aclMiddleware', {
					ip: rawIp,
					ua,
					path
				})
				res
					.status(403)
					.json(
						new Result(
							true,
							ErrorCode.NotAuthorized,
							'Access denied by access control policy',
							null
						)
					)
				return
			}

			next()
		} catch (error) {
			log.error('Unexpected error in ACL middleware', 'aclMiddleware', error as Error, {})
			res
				.status(500)
				.json(
					new Result(
						true,
						ErrorCode.InternalServerError,
						'Internal server error in ACL evaluation',
						null
					)
				)
		}
	}
}

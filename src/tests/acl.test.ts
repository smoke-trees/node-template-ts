import { ErrorCode, Result } from '@smoke-trees/postgres-backend'
import { assert } from 'chai'
import { NextFunction, Request, Response } from 'express'
import {
	cidrToRange,
	compileRules,
	createAclMiddleware,
	IAclRule,
	ipInCidr,
	ipToInt,
	isAllowed,
	matchesPath,
	normalizeIp
} from '../app/aclRule'
import { AclRuleService } from '../app/aclRule/AclRule.service'

export function AclTestSuite(): void {
	describe('ACL Engine Unit Tests', () => {
		it('should normalize IPv6 and loopback addresses properly', () => {
			assert.equal(normalizeIp('::ffff:192.168.1.1'), '192.168.1.1')
			assert.equal(normalizeIp('::1'), '127.0.0.1')
			assert.equal(normalizeIp(' 10.0.0.1 '), '10.0.0.1')
		})

		it('should convert IPv4 to 32-bit unsigned integer and check CIDR ranges', () => {
			const ip = '192.168.1.5'
			const ipInt = ipToInt(ip)
			assert.isAbove(ipInt, 0)

			const { start, end } = cidrToRange('192.168.1.0/24')
			assert.isTrue(ipInt >= start && ipInt <= end)
			assert.isTrue(ipInCidr('192.168.1.50', '192.168.1.0/24'))
			assert.isFalse(ipInCidr('192.168.2.1', '192.168.1.0/24'))
		})

		it('should match path patterns including wildcards', () => {
			assert.isTrue(matchesPath(null, '/any/path'))
			assert.isTrue(matchesPath(undefined, '/any/path'))
			assert.isTrue(matchesPath('/admin/*', '/admin/dashboard'))
			assert.isTrue(matchesPath('/admin/*', '/admin/users/123'))
			assert.isFalse(matchesPath('/admin/*', '/public/home'))
			assert.isTrue(matchesPath('/api/v1/users', '/api/v1/users'))
			assert.isFalse(matchesPath('/api/v1/users', '/api/v1/users/create'))
		})

		it('should compile raw rules into precomputed CompiledRule structures', () => {
			const rawRules: IAclRule[] = [
				{
					id: '1',
					type: 'ua',
					value: 'curl/.*',
					action: 'block',
					pathPattern: null,
					priority: 0,
					exceptIps: ['203.0.113.5', '198.51.100.0/24'],
					enabled: true
				},
				{
					id: '2',
					type: 'ip',
					value: '45.33.12.9',
					action: 'block',
					pathPattern: null,
					priority: 10,
					enabled: true
				}
			]

			const compiled = compileRules(rawRules)
			assert.equal(compiled.length, 2)
			assert.exists(compiled[0].exceptExactSet)
			assert.isTrue(compiled[0].exceptExactSet?.has('203.0.113.5'))
			assert.deepEqual(compiled[0].exceptCidrs, ['198.51.100.0/24'])
			assert.exists(compiled[0].uaRegex)
			assert.isTrue(compiled[0].uaRegex?.test('curl/8.1.2'))
		})

		it('should block specific IP and allow others by default', () => {
			const rules = compileRules([
				{
					id: '1',
					type: 'ip',
					value: '192.168.1.100',
					action: 'block',
					pathPattern: null,
					priority: 0,
					enabled: true
				}
			])

			assert.equal(isAllowed(rules, '192.168.1.100', 'Mozilla/5.0', '/api/test'), 'block')
			assert.equal(isAllowed(rules, '192.168.1.101', 'Mozilla/5.0', '/api/test'), 'allow')
		})

		it('should block CIDR subnet and respect exceptIps', () => {
			const rules = compileRules([
				{
					id: '1',
					type: 'cidr',
					value: '10.0.0.0/24',
					action: 'block',
					pathPattern: null,
					priority: 0,
					exceptIps: ['10.0.0.42'],
					enabled: true
				}
			])

			assert.equal(isAllowed(rules, '10.0.0.1', 'Mozilla/5.0', '/'), 'block')
			assert.equal(isAllowed(rules, '10.0.0.42', 'Mozilla/5.0', '/'), 'allow')
			assert.equal(isAllowed(rules, '10.0.1.1', 'Mozilla/5.0', '/'), 'allow')
		})

		it('should block User-Agent matching pattern except for exempted IPs', () => {
			const rules = compileRules([
				{
					id: '1',
					type: 'ua',
					value: 'curl/.*',
					action: 'block',
					pathPattern: null,
					priority: 0,
					exceptIps: ['203.0.113.5', '198.51.100.0/28'],
					enabled: true
				}
			])

			// Normal browser allowed
			assert.equal(isAllowed(rules, '1.2.3.4', 'Mozilla/5.0', '/dashboard'), 'allow')
			// curl from random IP blocked
			assert.equal(isAllowed(rules, '1.2.3.4', 'curl/8.1.2', '/dashboard'), 'block')
			// curl from exact excepted IP allowed
			assert.equal(isAllowed(rules, '203.0.113.5', 'curl/8.1.2', '/dashboard'), 'allow')
			// curl from CIDR excepted IP allowed
			assert.equal(isAllowed(rules, '198.51.100.2', 'curl/8.1.2', '/dashboard'), 'allow')
		})

		it('should respect path-scoped rules', () => {
			const rules = compileRules([
				{
					id: '1',
					type: 'ua',
					value: 'Mozilla/.*',
					action: 'block',
					pathPattern: '/webhook*',
					priority: 0,
					enabled: true
				}
			])

			// Browser allowed on regular routes
			assert.equal(isAllowed(rules, '9.9.9.9', 'Mozilla/5.0', '/dashboard'), 'allow')
			// Browser blocked on webhook route
			assert.equal(isAllowed(rules, '9.9.9.9', 'Mozilla/5.0', '/webhook/stripe'), 'block')
			// Non-browser allowed on webhook route
			assert.equal(isAllowed(rules, '9.9.9.9', 'Stripe/1.0', '/webhook/stripe'), 'allow')
		})

		it('should resolve priority: equal or higher priority allow overrides block', () => {
			const rules = compileRules([
				{
					id: '1',
					type: 'ip',
					value: '192.168.1.50',
					action: 'block',
					pathPattern: null,
					priority: 5,
					enabled: true
				},
				{
					id: '2',
					type: 'ip',
					value: '192.168.1.50',
					action: 'allow',
					pathPattern: null,
					priority: 10,
					enabled: true
				}
			])

			assert.equal(isAllowed(rules, '192.168.1.50', 'Mozilla/5.0', '/'), 'allow')

			const lowerPriorityAllowRules = compileRules([
				{
					id: '1',
					type: 'ip',
					value: '192.168.1.50',
					action: 'block',
					pathPattern: null,
					priority: 10,
					enabled: true
				},
				{
					id: '2',
					type: 'ip',
					value: '192.168.1.50',
					action: 'allow',
					pathPattern: null,
					priority: 5,
					enabled: true
				}
			])

			assert.equal(isAllowed(lowerPriorityAllowRules, '192.168.1.50', 'Mozilla/5.0', '/'), 'block')
		})

		it('should prioritize IP/CIDR tier when block is overridden by allow over UA tier', () => {
			const rules = compileRules([
				{
					id: '1',
					type: 'cidr',
					value: '1.2.3.0/24',
					action: 'block',
					pathPattern: null,
					priority: 5,
					enabled: true
				},
				{
					id: '2',
					type: 'ip',
					value: '1.2.3.4',
					action: 'allow',
					pathPattern: null,
					priority: 10,
					enabled: true
				},
				{
					id: '3',
					type: 'ua',
					value: 'curl/.*',
					action: 'block',
					pathPattern: null,
					priority: 100,
					enabled: true
				}
			])

			// IP tier has a block overridden by allow -> resolves to 'allow' immediately, UA tier never runs
			assert.equal(isAllowed(rules, '1.2.3.4', 'curl/8.1.2', '/test'), 'allow')
			// Another IP in CIDR has block not overridden -> blocks in IP tier
			assert.equal(isAllowed(rules, '1.2.3.5', 'Mozilla/5.0', '/test'), 'block')
		})
	})

	describe('Blanket ACL Middleware Tests', () => {
		const mockService = {
			getCompiledRules: () =>
				compileRules([
					{
						id: '1',
						type: 'ip',
						value: '10.99.99.99',
						action: 'block',
						pathPattern: null,
						priority: 0,
						enabled: true
					},
					{
						id: '2',
						type: 'ua',
						value: 'BadBot/.*',
						action: 'block',
						pathPattern: null,
						priority: 0,
						enabled: true
					}
				])
		} as AclRuleService

		const skippedRoutes = ['/docs*', '/health']
		const middleware = createAclMiddleware(mockService, skippedRoutes)

		it('should skip routes configured in aclSkippedRoutes', (done) => {
			const req = {
				path: '/docs/swagger.json',
				headers: { 'x-forwarded-for': '10.99.99.99' },
				socket: {}
			} as unknown as Request

			let nextCalled = false
			const res = {
				status: () => res,
				json: () => res
			} as unknown as Response

			const next: NextFunction = () => {
				nextCalled = true
			}

			middleware(req, res, next)
			assert.isTrue(nextCalled)
			done()
		})

		it('should skip /health route', (done) => {
			const req = {
				path: '/health',
				headers: { 'x-forwarded-for': '10.99.99.99' },
				socket: {}
			} as unknown as Request

			let nextCalled = false
			const res = {} as Response
			const next: NextFunction = () => {
				nextCalled = true
			}

			middleware(req, res, next)
			assert.isTrue(nextCalled)
			done()
		})

		it('should block non-skipped requests with blocked IP and return 403 Result object', (done) => {
			const req = {
				path: '/api/data',
				headers: { 'x-forwarded-for': '10.99.99.99, 127.0.0.1' },
				socket: {}
			} as unknown as Request

			let statusCode = 0
			let responseBody: Result<unknown> | null = null

			const res = {
				status: (code: number) => {
					statusCode = code
					return res
				},
				json: (data: Result<unknown>) => {
					responseBody = data
					return res
				}
			} as unknown as Response

			let nextCalled = false
			const next: NextFunction = () => {
				nextCalled = true
			}

			middleware(req, res, next)
			assert.isFalse(nextCalled)
			assert.equal(statusCode, 403)
			assert.exists(responseBody)
			const body1 = responseBody as unknown as Result<unknown>
			assert.isTrue(body1.status.error)
			assert.equal(body1.status.code, ErrorCode.NotAuthorized)
			assert.equal(body1.message, 'Access denied by access control policy')
			done()
		})

		it('should block non-skipped requests with blocked User-Agent', (done) => {
			const req = {
				path: '/api/data',
				headers: {
					'x-forwarded-for': '192.168.1.1',
					'user-agent': 'BadBot/1.0'
				},
				socket: {}
			} as unknown as Request

			let statusCode = 0
			let responseBody: Result<unknown> | null = null

			const res = {
				status: (code: number) => {
					statusCode = code
					return res
				},
				json: (data: Result<unknown>) => {
					responseBody = data
					return res
				}
			} as unknown as Response

			let nextCalled = false
			const next: NextFunction = () => {
				nextCalled = true
			}

			middleware(req, res, next)
			assert.isFalse(nextCalled)
			assert.equal(statusCode, 403)
			assert.exists(responseBody)
			const body2 = responseBody as unknown as Result<unknown>
			assert.isTrue(body2.status.error)
			done()
		})

		it('should allow legitimate requests and invoke next()', (done) => {
			const req = {
				path: '/api/data',
				headers: {
					'x-forwarded-for': '192.168.1.1',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
				},
				socket: {}
			} as unknown as Request

			let nextCalled = false
			const res = {} as Response
			const next: NextFunction = () => {
				nextCalled = true
			}

			middleware(req, res, next)
			assert.isTrue(nextCalled)
			done()
		})
	})

	describe('AclRuleService In-Memory Cache and DB Sync Tests', () => {
		it('should load rules and compile them in memory', async () => {
			const { container } = await import('../setup')
			const service = container.get(AclRuleService)

			// Clean any existing test rules
			const existing = await service.dao.readMany({ nonPaginated: true })
			if (existing.result && existing.result.length > 0) {
				for (const rule of existing.result) {
					await service.dao.delete(rule.id)
				}
			}

			// Initially empty
			await service.loadRules()
			assert.equal(service.getCompiledRules().length, 0)

			// Create a rule via service
			const createRes = await service.create({
				type: 'ip',
				value: '172.16.0.1',
				action: 'block',
				priority: 0,
				pathPattern: '/test*'
			})
			assert.isFalse(createRes.status.error)
			assert.exists(createRes.result)

			// In-memory rules must automatically be refreshed after create
			const rulesAfterCreate = service.getCompiledRules()
			assert.equal(rulesAfterCreate.length, 1)
			assert.equal(rulesAfterCreate[0].value, '172.16.0.1')
			assert.equal(rulesAfterCreate[0].action, 'block')

			// Update the rule
			const ruleId = createRes.result as string
			const updateRes = await service.update(ruleId, {
				action: 'allow'
			})
			assert.isFalse(updateRes.status.error)

			// In-memory rules must automatically be refreshed after update
			const rulesAfterUpdate = service.getCompiledRules()
			assert.equal(rulesAfterUpdate.length, 1)
			assert.equal(rulesAfterUpdate[0].action, 'allow')

			// Delete the rule
			const deleteRes = await service.delete(ruleId)
			assert.isFalse(deleteRes.status.error)

			// In-memory rules must automatically be refreshed after delete
			const rulesAfterDelete = service.getCompiledRules()
			assert.equal(rulesAfterDelete.length, 0)
		})
	})
}

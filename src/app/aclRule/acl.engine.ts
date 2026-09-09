import { CompiledRule, Decision, IAclRule } from './IAclRule'

export function normalizeIp(ip: string): string {
	const trimmed = ip.trim()
	if (trimmed.startsWith('::ffff:')) {
		return trimmed.slice(7)
	}
	if (trimmed === '::1') {
		return '127.0.0.1'
	}
	return trimmed
}

export function ipToInt(ip: string): number {
	const parts = ip.split('.')
	if (parts.length !== 4) return 0
	return parts.reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

export function cidrToRange(cidr: string): { start: number; end: number } {
	const [ip, prefixStr] = cidr.split('/')
	const prefix = parseInt(prefixStr, 10)
	const ipInt = ipToInt(ip)
	const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
	return { start: (ipInt & mask) >>> 0, end: (ipInt | ~mask) >>> 0 }
}

export function ipInCidr(ip: string, cidr: string): boolean {
	const { start, end } = cidrToRange(cidr)
	const ipInt = ipToInt(ip)
	return ipInt >= start && ipInt <= end
}

const pathRegexCache = new Map<string, RegExp>()

export function matchesPath(pathPattern: string | null | undefined, path: string): boolean {
	if (!pathPattern) return true
	let re = pathRegexCache.get(pathPattern)
	if (!re) {
		re = new RegExp('^' + pathPattern.replace(/\*/g, '.*') + '$')
		pathRegexCache.set(pathPattern, re)
	}
	return re.test(path)
}

const uaRegexCache = new Map<string, RegExp>()

export function getUaRegex(pattern: string): RegExp {
	let re = uaRegexCache.get(pattern)
	if (!re) {
		re = new RegExp(pattern, 'i')
		uaRegexCache.set(pattern, re)
	}
	return re
}

export function isExcepted(rule: CompiledRule, ip: string): boolean {
	if (rule.exceptExactSet?.has(ip)) return true
	if (rule.exceptCidrs) {
		for (const cidr of rule.exceptCidrs) {
			if (ipInCidr(ip, cidr)) return true
		}
	}
	return false
}

export function ipOrCidrMatches(rule: CompiledRule, ip: string): boolean {
	const baseMatch = rule.type === 'ip' ? normalizeIp(rule.value) === ip : ipInCidr(ip, rule.value)
	if (!baseMatch) return false
	return !isExcepted(rule, ip)
}

export function uaMatches(rule: CompiledRule, ua: string, ip: string): boolean {
	const baseMatch = (rule.uaRegex ?? getUaRegex(rule.value)).test(ua)
	if (!baseMatch) return false
	return !isExcepted(rule, ip)
}

export function resolveTier(tierRules: CompiledRule[]): Decision | null {
	const blocks = tierRules.filter((r) => r.action === 'block')
	if (blocks.length === 0) return null

	const topBlockPriority = Math.max(...blocks.map((r) => r.priority ?? 0))
	const allows = tierRules.filter((r) => r.action === 'allow')
	const overridingAllow = allows.some((r) => (r.priority ?? 0) >= topBlockPriority)

	return overridingAllow ? 'allow' : 'block'
}

export function compileRules(rules: IAclRule[]): CompiledRule[] {
	return rules.map((r) => {
		const exact = new Set<string>()
		const cidrs: string[] = []
		for (const entry of r.exceptIps ?? []) {
			const normalized = normalizeIp(entry)
			if (normalized.includes('/')) cidrs.push(normalized)
			else exact.add(normalized)
		}
		return {
			...r,
			priority: r.priority ?? 0,
			exceptExactSet: exact.size > 0 ? exact : undefined,
			exceptCidrs: cidrs.length > 0 ? cidrs : undefined,
			uaRegex: r.type === 'ua' ? getUaRegex(r.value) : undefined
		}
	})
}

export function isAllowed(
	rules: CompiledRule[],
	rawIp: string,
	ua: string,
	path: string,
	defaultPosture: Decision = 'allow'
): Decision {
	const ip = normalizeIp(rawIp)
	const ipCidrTier: CompiledRule[] = []
	const uaTier: CompiledRule[] = []

	for (const rule of rules) {
		if (!matchesPath(rule.pathPattern, path)) continue

		if (rule.type === 'ip' || rule.type === 'cidr') {
			if (ipOrCidrMatches(rule, ip)) ipCidrTier.push(rule)
		} else if (rule.type === 'ua') {
			if (uaMatches(rule, ua, ip)) uaTier.push(rule)
		}
	}

	const ipCidrDecision = resolveTier(ipCidrTier)
	if (ipCidrDecision !== null) return ipCidrDecision

	const uaDecision = resolveTier(uaTier)
	if (uaDecision !== null) return uaDecision

	return defaultPosture
}

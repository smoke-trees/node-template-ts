export type RuleType = 'ip' | 'cidr' | 'ua'
export type RuleAction = 'block' | 'allow'
export type Decision = 'allow' | 'block'

export interface IAclRule {
	id?: string
	type: RuleType
	value: string
	action: RuleAction
	pathPattern?: string | null
	priority?: number
	exceptIps?: string[] | null
	enabled: boolean
}

export interface CompiledRule extends IAclRule {
	exceptExactSet?: Set<string>
	exceptCidrs?: string[]
	uaRegex?: RegExp
}

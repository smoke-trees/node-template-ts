import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IAclRule, RuleAction, RuleType } from './IAclRule'

@Documentation.addSchema()
@Entity({ name: 'acl_rule' })
export class AclRule extends BaseEntity implements IAclRule {
	@Documentation.addField({ type: 'string' })
	@PrimaryGeneratedColumn('uuid', { name: 'id' })
	declare id: string

	@Documentation.addField({ type: 'string', enum: ['ip', 'cidr', 'ua'] })
	@Column({ type: 'varchar', name: 'type' })
	type!: RuleType

	@Documentation.addField({ type: 'string' })
	@Column({ type: 'varchar', name: 'value' })
	value!: string

	@Documentation.addField({ type: 'string', enum: ['block', 'allow'] })
	@Column({ type: 'varchar', name: 'action' })
	action!: RuleAction

	@Documentation.addField({ type: 'string', nullable: true })
	@Column({ type: 'varchar', name: 'path_pattern', nullable: true })
	pathPattern?: string | null

	@Documentation.addField({ type: 'number', default: 0 })
	@Column({ type: 'int', name: 'priority', default: 0 })
	priority!: number

	@Documentation.addField({ type: 'array', items: { type: 'string' }, nullable: true })
	@Column({ type: 'jsonb', name: 'except_ips', nullable: true })
	exceptIps?: string[] | null

	@Documentation.addField({ type: 'boolean', default: true })
	@Column({ type: 'boolean', name: 'enabled', default: true })
	enabled!: boolean

	constructor(data?: IAclRule) {
		super(data)
		if (data) {
			if (data.id) this.id = data.id
			this.type = data.type
			this.value = data.value
			this.action = data.action
			this.pathPattern = data.pathPattern ?? null
			this.priority = data.priority ?? 0
			this.exceptIps = data.exceptIps ?? null
		}
	}
}

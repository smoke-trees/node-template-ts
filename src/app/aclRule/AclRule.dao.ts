import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject, injectable } from 'inversify'
import { AclRule } from './AclRule.entity'

@injectable()
export class AclRuleDao extends Dao<AclRule> {
	constructor(
		@inject('database')
		database: Database
	) {
		super(database, AclRule, 'acl_rule')
	}
}

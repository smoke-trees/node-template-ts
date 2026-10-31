import { ErrorCode, Result, Service } from '@smoke-trees/postgres-backend'
import { inject, injectable } from 'inversify'
import { EntityManager, FindOptionsWhere } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { log } from '../../log'
import { AclRuleDao } from './AclRule.dao'
import { AclRule } from './AclRule.entity'
import { compileRules } from './acl.engine'
import { CompiledRule } from './IAclRule'

@injectable()
export class AclRuleService extends Service<AclRule> {
	declare dao: AclRuleDao
	private compiledRules: CompiledRule[] = []

	constructor(@inject(AclRuleDao) dao: AclRuleDao) {
		super(dao)
		this.dao = dao
	}

	getCompiledRules(): CompiledRule[] {
		return this.compiledRules
	}

	async loadRules() {
		try {
			const readRes = await this.dao.readMany({ nonPaginated: true, where: { enabled: true } })
			if (readRes.status.error || !readRes.result) {
				log.warn('Could not read ACL rules from database', 'AclRuleService.loadRules', {
					message: readRes.message
				})
				return new Result(false, ErrorCode.Success, 'No ACL rules loaded', this.compiledRules)
			}
			this.compiledRules = compileRules(readRes.result)
			log.info(
				`Compiled ${this.compiledRules.length} ACL rules in memory`,
				'AclRuleService.loadRules',
				{
					count: this.compiledRules.length
				}
			)
			return new Result(
				false,
				ErrorCode.Success,
				'Loaded and compiled ACL rules',
				this.compiledRules
			)
		} catch (error) {
			log.error(
				'Failed to load ACL rules from database',
				'AclRuleService.loadRules',
				error as Error,
				{}
			)
			return new Result(
				true,
				ErrorCode.InternalServerError,
				'Failed to load ACL rules',
				this.compiledRules
			)
		}
	}

	async refreshRules() {
		return await this.loadRules()
	}

	async create(value: Parameters<Service<AclRule>['create']>[0], manager?: EntityManager) {
		try {
			const res = await super.create(value, manager)
			if (!res.status.error) {
				await this.loadRules()
			}
			return res
		} catch (error) {
			log.error('Error creating ACL rule', 'AclRuleService.create', error as Error, {})
			return new Result(true, ErrorCode.InternalServerError, 'Error creating ACL rule', null)
		}
	}

	async update(
		id: string | number | FindOptionsWhere<AclRule>,
		values: QueryDeepPartialEntity<AclRule>,
		manager?: EntityManager
	) {
		try {
			const res = await super.update(id, values, manager)
			if (!res.status.error) {
				await this.loadRules()
			}
			return res
		} catch (error) {
			log.error('Error updating ACL rule', 'AclRuleService.update', error as Error, {})
			return new Result(true, ErrorCode.InternalServerError, 'Error updating ACL rule', null)
		}
	}

	async delete(
		id: string | number | string[] | FindOptionsWhere<AclRule>,
		manager?: EntityManager
	) {
		try {
			const res = await super.delete(id, manager)
			if (!res.status.error) {
				await this.loadRules()
			}
			return res
		} catch (error) {
			log.error('Error deleting ACL rule', 'AclRuleService.delete', error as Error, {})
			return new Result(true, ErrorCode.InternalServerError, 'Error deleting ACL rule', null)
		}
	}
}

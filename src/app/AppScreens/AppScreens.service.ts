import { ErrorCode, log, Result, Service } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { IsNull, LessThan } from 'typeorm'
import database from '../../database'
import { AppScreensDao } from './AppScreens.dao'
import { AppScreens } from './AppScreens.entity'

export class AppScreensService extends Service<AppScreens> {
	dao: AppScreensDao
	constructor(
		@inject(AppScreensDao)
		dao: AppScreensDao
	) {
		super(dao)
		this.dao = dao
	}

	async deployScreen(screenName: string, screenJson: string, appVersion: string) {
		const lastDeployed = await this.dao.readMany({
			where: { screenName, supportedAppVersion: appVersion },
			page: 1,
			count: 3,
			field: 'version',
			order: 'DESC'
		})

		log.debug('last deployed', 'AppScreensService/deployScreen', lastDeployed)

		let newVersion = 1

		if (!lastDeployed.status.error && lastDeployed.result && lastDeployed.result.length > 0) {
			newVersion = lastDeployed.result[0].version + 1
			const existingLatest = await this.dao.read({ where: { screenName, isLatest: true } })

			if (!existingLatest.status.error && existingLatest.result) {
				log.debug('updating last latest app screen version', 'AppScreensService/deployScreen', {
					screenName,
					id: existingLatest.result.id
				})
				await this.dao.update(existingLatest.result.id, {
					isLatest: false
				})
			}
		}

		const checkOlderScreens = await this.dao.readMany({
			where: { screenName },
			page: 1,
			count: 3,
			field: 'version',
			order: 'DESC'
		})

		if (
			!checkOlderScreens.status.error &&
			checkOlderScreens.result &&
			checkOlderScreens.result.length > 0
		) {
			log.debug('checking older screens', 'AppScreensService/deployScreen', checkOlderScreens)
			newVersion = checkOlderScreens.result[0].version + 1
		}

		log.debug('creating new app screen version', 'AppScreensService/deployScreen', {
			screenName,
			version: newVersion
		})

		return await this.dao.create({
			screenName,
			screenJson,
			version: newVersion,
			isLatest: true,
			supportedAppVersion: appVersion,
			lastDeployed: new Date().toISOString()
		})
	}

	async scheduleDeployScreen(
		screenName: string,
		screenJson: string,
		scheduleStartDate: string,
		scheduleEndDate: string,
		makeLatest = false,
		appVersion: string
	) {
		const lastDeployed = await this.dao.readMany({
			where: { screenName, supportedAppVersion: appVersion },
			page: 1,
			count: 3,
			field: 'version',
			order: 'DESC'
		})

		log.debug('last deployed', 'AppScreensService/deployScreen', lastDeployed)

		let newVersion = 1

		if (!lastDeployed.status.error && lastDeployed.result && lastDeployed.result.length > 0) {
			newVersion = lastDeployed.result[0].version + 1
			if (makeLatest) {
				const existingLatest = await this.dao.read({ where: { screenName, isLatest: true } })

				if (!existingLatest.status.error && existingLatest.result) {
					log.debug('updating last latest app screen version', 'AppScreensService/deployScreen', {
						screenName,
						id: existingLatest.result.id
					})
					await this.dao.update(existingLatest.result.id, {
						isLatest: false
					})
				}
			}
		}

		const checkOlderScreens = await this.dao.readMany({
			where: { screenName },
			page: 1,
			count: 3,
			field: 'version',
			order: 'DESC'
		})

		if (
			!checkOlderScreens.status.error &&
			checkOlderScreens.result &&
			checkOlderScreens.result.length > 0
		) {
			log.debug('checking older screens', 'AppScreensService/deployScreen', checkOlderScreens)
			newVersion = checkOlderScreens.result[0].version + 1
		}

		log.debug('creating new app screen version', 'AppScreensService/deployScreen', {
			screenName,
			version: newVersion
		})

		return await this.dao.create({
			screenName,
			screenJson,
			scheduleStartDate: scheduleStartDate,
			scheduleEndDate: scheduleEndDate,
			version: newVersion,
			isLatest: makeLatest,
			supportedAppVersion: appVersion,
			lastDeployed: new Date().toISOString()
		})
	}

	async revertLatest(screenName: string, appVersion: string, version?: number) {
		const latest = await this.dao.read({
			where: { screenName, isLatest: true, supportedAppVersion: appVersion }
		})

		if (latest.status.error || !latest.result) {
			log.debug('screen not found', 'AppScreensService/revertLatest', latest)
			return new Result(true, ErrorCode.NotFound, 'screen not found')
		}

		if (latest.result.version === (version ?? 1)) {
			log.debug('version is already latest', 'AppScreensService/revertLatest', latest)
			return new Result(true, ErrorCode.BadRequest, 'version is already latest')
		}
		const updateResult = await this.dao.update(
			{ screenName, version: version ?? latest.result.version - 1 },
			{ isLatest: true }
		)
		log.debug('updateResult', 'AppScreensService/revertLatest', {
			screenName,
			version: version ?? latest.result.version - 1,
			isLatest: true
		})
		if (!updateResult.status.error) {
			await this.dao.update(latest.result.id, {
				isLatest: false
			})
		}

		return updateResult
	}

	async activateScheduled(today?: string) {
		try {
			const targetDate = (today ?? new Date().toISOString()).slice(0, 10)

			const active = await database
				.getConnection()
				.createQueryBuilder(AppScreens, 'screen')
				.distinctOn(['screen.screenName'])
				.where('screen.scheduleStartDate <= :today', { today: targetDate })
				.andWhere('screen.scheduleEndDate >= :today', { today: targetDate })
				.orderBy('screen.screenName', 'DESC')
				.addOrderBy('screen.version', 'DESC')
				.getMany()

			for (const row of active) {
				await this.dao.update({ screenName: row.screenName, isLatest: true }, { isLatest: false })
				await this.dao.update(row.id, { isLatest: true })
				log.debug('activated scheduled screen', 'AppScreensService/activateScheduled', {
					screenName: row.screenName,
					version: row.version,
					date: targetDate
				})
			}

			log.info('activated scheduled screens', 'AppScreensService/activateScheduled', {
				date: targetDate,
				count: active.length
			})
			return new Result(false, ErrorCode.Success, 'Scheduled screens activated', {
				date: targetDate,
				count: active.length
			})
		} catch (error) {
			log.error('error activating scheduled screens', 'AppScreensService/activateScheduled', error)
			return new Result(true, ErrorCode.InternalServerError, 'Error activating scheduled screens')
		}
	}

	async expireScheduled(today?: string) {
		try {
			const targetDate = (today ?? new Date().toISOString()).slice(0, 10)
			const expired = await this.dao.readMany({
				where: { scheduleEndDate: LessThan(targetDate), isLatest: true },
				nonPaginated: true
			})
			const rows = !expired.status.error && expired.result ? expired.result : []

			let restored = 0

			for (const row of rows) {
				await this.dao.update(row.id, { isLatest: false })
				const fallback = await this.dao.readMany({
					where: { screenName: row.screenName, scheduleStartDate: IsNull() },
					order: 'DESC',
					field: 'version'
				})
				if (!fallback.status.error && fallback.result) {
					await this.dao.update(fallback.result[0].id, { isLatest: true })
					restored++
					log.debug(
						'schedule ended, restored latest non-scheduled screen',
						'AppScreensService/expireScheduled',
						{ screenName: row.screenName, version: fallback.result[0].version, date: targetDate }
					)
				} else {
					log.warn(
						'schedule ended with no non-scheduled fallback, cleared isLatest',
						'AppScreensService/expireScheduled',
						{ screenName: row.screenName, date: targetDate }
					)
				}
			}

			log.info('expired scheduled screens', 'AppScreensService/expireScheduled', {
				date: targetDate,
				expired: rows.length,
				restored
			})
			return new Result(false, ErrorCode.Success, 'Expired schedules cleared', {
				date: targetDate,
				expired: rows.length,
				restored
			})
		} catch (error) {
			log.error('error expiring scheduled screens', 'AppScreensService/expireScheduled', error)
			return new Result(true, ErrorCode.InternalServerError, 'Error expiring scheduled screens')
		}
	}

	async getLatestScreen(screenName: string, appVersion: string) {
		const latest = await this.dao.read({
			where: { screenName, supportedAppVersion: appVersion, isLatest: true }
		})
		return latest
	}
}

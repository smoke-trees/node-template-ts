import { ErrorCode, log, Result, Service } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { IsNull, LessThan } from 'typeorm'
import database from '../../database'
import { AppThemesDao } from './AppThemes.dao'
import { AppThemes } from './AppThemes.entity'

export class AppThemesService extends Service<AppThemes> {
	dao: AppThemesDao
	constructor(
		@inject(AppThemesDao)
		dao: AppThemesDao
	) {
		super(dao)
		this.dao = dao
	}

	async deployTheme(themeName: string, themeJson: string, appVersion: string) {
		const lastDeployed = await this.dao.readMany({
			where: { themeName, supportedAppVersion: appVersion },
			page: 1,
			count: 3,
			field: 'version',
			order: 'DESC'
		})

		let newVersion = 1

		if (
			!lastDeployed.status.error &&
			lastDeployed.result &&
			(lastDeployed.result.length ?? 0) > 0
		) {
			newVersion = lastDeployed.result[0].version + 1
			const existingLatest = await this.dao.read({ where: { themeName, isLatest: true } })

			if (!existingLatest.status.error && existingLatest.result) {
				log.debug('updating last latest app screen version', 'AppThemesService/deployScreen', {
					themeName,
					id: existingLatest.result.id
				})
				await this.dao.update(existingLatest.result.id, {
					isLatest: false
				})
			}
		}

		const checkOlderScreens = await this.dao.readMany({
			where: { themeName },
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
			log.debug('checking older screens', 'AppThemesService/deployScreen', checkOlderScreens)
			newVersion = checkOlderScreens.result[0].version + 1
		}

		log.debug('creating new app screen version', 'AppThemesService/deployScreen', {
			themeName,
			version: newVersion
		})

		return await this.dao.create({
			themeName,
			themeJson,
			version: newVersion,
			isLatest: true,
			supportedAppVersion: appVersion,
			lastDeployed: new Date().toISOString()
		})
	}

	async scheduleDeployTheme(
		themeName: string,
		themeJson: string,
		scheduleStartDate: string,
		scheduleEndDate: string,
		makeLatest = false,
		appVersion: string
	) {
		const lastDeployed = await this.dao.readMany({
			where: { themeName, supportedAppVersion: appVersion },
			page: 1,
			count: 3,
			field: 'version',
			order: 'DESC'
		})

		log.debug('last deployed', 'AppThemesService/deployScreen', lastDeployed)

		let newVersion = 1

		if (!lastDeployed.status.error && lastDeployed.result && lastDeployed.result.length > 0) {
			newVersion = lastDeployed.result[0].version + 1
			if (makeLatest) {
				const existingLatest = await this.dao.read({ where: { themeName, isLatest: true } })

				if (!existingLatest.status.error && existingLatest.result) {
					log.debug('updating last latest app screen version', 'AppThemesService/deployScreen', {
						themeName,
						id: existingLatest.result.id
					})
					await this.dao.update(existingLatest.result.id, {
						isLatest: false
					})
				}
			}
		}

		const checkOlderScreens = await this.dao.readMany({
			where: { themeName },
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
			log.debug('checking older screens', 'AppThemesService/deployScreen', checkOlderScreens)
			newVersion = checkOlderScreens.result[0].version + 1
		}

		log.debug('creating new app screen version', 'AppThemesService/deployScreen', {
			themeName,
			version: newVersion
		})

		return await this.dao.create({
			themeName,
			themeJson,
			scheduleStartDate,
			scheduleEndDate,
			version: newVersion,
			isLatest: makeLatest,
			supportedAppVersion: appVersion,
			lastDeployed: new Date().toISOString()
		})
	}

	async revertLatest(themeName: string, appVersion: string, version?: number) {
		const latest = await this.dao.read({
			where: { themeName, supportedAppVersion: appVersion, isLatest: true }
		})

		if (latest.status.error || !latest.result) {
			log.debug('screen not found', 'AppThemesService/revertLatest', latest)
			return new Result(true, ErrorCode.NotFound, 'screen not found')
		}

		if (latest.result.version === (version ?? 1)) {
			log.debug('version is already latest', 'AppThemesService/revertLatest', latest)
			return new Result(true, ErrorCode.BadRequest, 'version is already latest')
		}
		const updateResult = await this.dao.update(
			{ themeName, supportedAppVersion: appVersion, version: version ?? latest.result.version - 1 },
			{ isLatest: true }
		)
		log.debug('updateResult', 'AppThemesService/revertLatest', {
			themeName,
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
				.createQueryBuilder(AppThemes, 'theme')
				.distinctOn(['theme.themeName'])
				.where('theme.scheduleStartDate <= :today', { today: targetDate })
				.andWhere('theme.scheduleEndDate >= :today', { today: targetDate })
				.orderBy('theme.themeName', 'ASC')
				.addOrderBy('theme.version', 'DESC')
				.getMany()

			for (const row of active) {
				await this.dao.update({ themeName: row.themeName, isLatest: true }, { isLatest: false })
				await this.dao.update(row.id, { isLatest: true })
				log.debug('activated scheduled theme', 'AppThemesService/activateScheduled', {
					themeName: row.themeName,
					version: row.version,
					date: targetDate
				})
			}

			log.info('activated scheduled themes', 'AppThemesService/activateScheduled', {
				date: targetDate,
				count: active.length
			})
			return new Result(false, ErrorCode.Success, 'Scheduled themes activated', {
				date: targetDate,
				count: active.length
			})
		} catch (error) {
			log.error('error activating scheduled themes', 'AppThemesService/activateScheduled', error)
			return new Result(true, ErrorCode.InternalServerError, 'Error activating scheduled themes')
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
					where: { themeName: row.themeName, scheduleStartDate: IsNull() },
					order: 'DESC',
					field: 'version'
				})
				if (!fallback.status.error && fallback.result) {
					await this.dao.update(fallback.result[0].id, { isLatest: true })
					restored++
					log.debug(
						'schedule ended, restored latest non-scheduled theme',
						'AppThemesService/expireScheduled',
						{ themeName: row.themeName, version: fallback.result[0].version, date: targetDate }
					)
				} else {
					log.warn(
						'schedule ended with no non-scheduled fallback, cleared isLatest',
						'AppThemesService/expireScheduled',
						{ themeName: row.themeName, date: targetDate }
					)
				}
			}

			log.info('expired scheduled themes', 'AppThemesService/expireScheduled', {
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
			log.error('error expiring scheduled themes', 'AppThemesService/expireScheduled', error)
			return new Result(true, ErrorCode.InternalServerError, 'Error expiring scheduled themes')
		}
	}

	async getLatestTheme(themeName: string, appVersion: string) {
		const latest = await this.dao.read({
			where: { themeName, supportedAppVersion: appVersion, isLatest: true }
		})
		return latest
	}
}

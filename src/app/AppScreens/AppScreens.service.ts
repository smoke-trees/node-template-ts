import { ErrorCode, log, Result, Service } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { In, IsNull, LessThan, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
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

	async deployScreen(
		screenName: string,
		screenJson: string,
		jsonVersion: string,
		minAppVersion: string,
		maxAppVersion?: string
	) {
		try {
			if (!screenName || !screenJson || !jsonVersion || !minAppVersion) {
				log.warn(
					'screenName, screenJson, jsonVersion and minAppVersion are required',
					'AppScreensService/deployScreen',
					{ screenName, jsonVersion, minAppVersion }
				)
				return new Result(
					true,
					ErrorCode.BadRequest,
					'screenName, screenJson, jsonVersion and minAppVersion are required'
				)
			}
			const parsedJson = this.parseVersion(jsonVersion)
			if (!parsedJson) {
				log.warn('invalid jsonVersion', 'AppScreensService/deployScreen', { jsonVersion })
				return new Result(true, ErrorCode.BadRequest, 'jsonVersion must be in x.y.z format')
			}
			const prepared = await this.prepareRange(screenName, minAppVersion, maxAppVersion)
			if (prepared.status.error || !prepared.result) return prepared
			await this.applyOverlapResolution(
				screenName,
				prepared.result.bands,
				prepared.result.newMin,
				prepared.result.normalizedMin,
				prepared.result.effectiveMaxParsed
			)
			const created = await this.dao.create({
				screenName,
				screenJson,
				jsonVersion: `${parsedJson[0]}.${parsedJson[1]}.${parsedJson[2]}`,
				minAppVersion: prepared.result.normalizedMin,
				maxAppVersion: prepared.result.effectiveMax,
				isActive: true,
				lastDeployed: new Date().toISOString()
			})
			log.info('deployed screen', 'AppScreensService/deployScreen', {
				screenName,
				jsonVersion,
				minAppVersion: prepared.result.normalizedMin,
				maxAppVersion: prepared.result.effectiveMax
			})
			return created
		} catch (error) {
			log.error('error deploying screen', 'AppScreensService/deployScreen', error, { screenName })
			return new Result(true, ErrorCode.InternalServerError, 'Error deploying screen')
		}
	}

	async scheduleDeployScreen(
		screenName: string,
		screenJson: string,
		jsonVersion: string,
		scheduleStartDate: string,
		scheduleEndDate: string,
		minAppVersion: string,
		makeLatest = false,
		maxAppVersion?: string
	) {
		try {
			if (
				!screenName ||
				!screenJson ||
				!jsonVersion ||
				!scheduleStartDate ||
				!scheduleEndDate ||
				!minAppVersion
			) {
				log.warn(
					'screenName, screenJson, jsonVersion, schedule dates and minAppVersion are required',
					'AppScreensService/scheduleDeployScreen',
					{ screenName, jsonVersion, scheduleStartDate, scheduleEndDate, minAppVersion }
				)
				return new Result(
					true,
					ErrorCode.BadRequest,
					'screenName, screenJson, jsonVersion, scheduleStartDate, scheduleEndDate and minAppVersion are required'
				)
			}
			const parsedJson = this.parseVersion(jsonVersion)
			if (!parsedJson) {
				log.warn('invalid jsonVersion', 'AppScreensService/scheduleDeployScreen', { jsonVersion })
				return new Result(true, ErrorCode.BadRequest, 'jsonVersion must be in x.y.z format')
			}
			if (scheduleStartDate > scheduleEndDate) {
				log.warn(
					'scheduleStartDate after scheduleEndDate',
					'AppScreensService/scheduleDeployScreen',
					{
						scheduleStartDate,
						scheduleEndDate
					}
				)
				return new Result(
					true,
					ErrorCode.BadRequest,
					'scheduleStartDate cannot be after scheduleEndDate'
				)
			}
			const prepared = await this.prepareRange(screenName, minAppVersion, maxAppVersion)
			if (prepared.status.error || !prepared.result) return prepared
			if (makeLatest) {
				await this.applyOverlapResolution(
					screenName,
					prepared.result.bands,
					prepared.result.newMin,
					prepared.result.normalizedMin,
					prepared.result.effectiveMaxParsed
				)
			}
			const created = await this.dao.create({
				screenName,
				screenJson,
				jsonVersion: `${parsedJson[0]}.${parsedJson[1]}.${parsedJson[2]}`,
				scheduleStartDate: scheduleStartDate,
				scheduleEndDate: scheduleEndDate,
				minAppVersion: prepared.result.normalizedMin,
				maxAppVersion: prepared.result.effectiveMax,
				isActive: makeLatest,
				lastDeployed: new Date().toISOString()
			})
			log.info('scheduled screen deploy', 'AppScreensService/scheduleDeployScreen', {
				screenName,
				jsonVersion,
				scheduleStartDate,
				scheduleEndDate
			})
			return created
		} catch (error) {
			log.error('error scheduling screen deploy', 'AppScreensService/scheduleDeployScreen', error, {
				screenName
			})
			return new Result(true, ErrorCode.InternalServerError, 'Error scheduling screen deploy')
		}
	}

	async activateJson(id: string) {
		try {
			if (!id) {
				log.warn('id is required', 'AppScreensService/activateJson', { id })
				return new Result(true, ErrorCode.BadRequest, 'id is required')
			}
			const targetResult = await this.dao.read({
				where: { id },
				select: {
					id: true,
					screenName: true,
					jsonVersion: true,
					minAppVersion: true,
					maxAppVersion: true,
					isActive: true
				}
			})
			if (targetResult.status.error || !targetResult.result) {
				log.debug('screen not found', 'AppScreensService/activateJson', { id })
				return new Result(true, ErrorCode.NotFound, 'screen not found')
			}
			const target = targetResult.result
			const targetMin = this.parseVersion(target.minAppVersion)
			if (!targetMin) {
				log.warn('target has invalid minAppVersion', 'AppScreensService/activateJson', {
					id,
					minAppVersion: target.minAppVersion
				})
				return new Result(true, ErrorCode.BadRequest, 'target has invalid minAppVersion')
			}
			let targetMax: number[] | null = null
			if (target.maxAppVersion) {
				targetMax = this.parseVersion(target.maxAppVersion)
				if (!targetMax) {
					log.warn('target has invalid maxAppVersion', 'AppScreensService/activateJson', {
						id,
						maxAppVersion: target.maxAppVersion
					})
					return new Result(true, ErrorCode.BadRequest, 'target has invalid maxAppVersion')
				}
			}
			const activeResult = await this.dao.readMany({
				where: { screenName: target.screenName, isActive: true },
				nonPaginated: true,
				select: { id: true, minAppVersion: true, maxAppVersion: true }
			})
			const rows = activeResult.result ?? []
			const tasks: Promise<unknown>[] = []
			for (const row of rows) {
				if (row.id === target.id) continue
				const min = this.parseVersion(row.minAppVersion)
				if (!min) continue
				if (targetMax && this.compareVersions(min, targetMax) > 0) continue
				if (row.maxAppVersion) {
					const max = this.parseVersion(row.maxAppVersion)
					if (!max) continue
					if (this.compareVersions(max, targetMin) < 0) continue
				}
				log.debug('deactivated overlapped screen', 'AppScreensService/activateJson', {
					screenName: target.screenName,
					id: row.id
				})
				tasks.push(this.dao.update(row.id, { isActive: false }))
			}
			if (!target.isActive) tasks.push(this.dao.update(target.id, { isActive: true }))
			await Promise.all(tasks)
			log.info('enabled screen json', 'AppScreensService/activateJson', {
				screenName: target.screenName,
				id: target.id,
				jsonVersion: target.jsonVersion
			})
			return new Result(false, ErrorCode.Success, 'screen json enabled', {
				id: target.id,
				screenName: target.screenName,
				jsonVersion: target.jsonVersion
			})
		} catch (error) {
			log.error('error enabling screen json', 'AppScreensService/activateJson', error, { id })
			return new Result(true, ErrorCode.InternalServerError, 'Error enabling screen json')
		}
	}

	async activateScheduled(today?: string) {
		try {
			const targetDate = (today ?? new Date().toISOString()).slice(0, 10)
			const dueResult = await this.dao.readMany({
				where: {
					scheduleStartDate: LessThanOrEqual(targetDate),
					scheduleEndDate: MoreThanOrEqual(targetDate)
				},
				nonPaginated: true,
				select: { id: true, screenName: true, jsonVersion: true, isActive: true }
			})
			const dueRows = !dueResult.status.error && dueResult.result ? dueResult.result : []
			const winners = new Map<string, (typeof dueRows)[number]>()
			const winnerJson = new Map<string, number[]>()
			for (const row of dueRows) {
				const json = this.parseVersion(row.jsonVersion)
				if (!json) continue
				const prev = winnerJson.get(row.screenName)
				if (!prev || this.compareVersions(json, prev) > 0) {
					winners.set(row.screenName, row)
					winnerJson.set(row.screenName, json)
				}
			}
			if (winners.size === 0) {
				log.info('no scheduled screens due', 'AppScreensService/activateScheduled', {
					date: targetDate
				})
				return new Result(false, ErrorCode.Success, 'Scheduled screens activated', {
					date: targetDate,
					count: 0
				})
			}
			const names: string[] = []
			winners.forEach((_row, name) => names.push(name))
			const activeResult = await this.dao.readMany({
				where: { screenName: In(names), isActive: true },
				nonPaginated: true,
				select: { id: true, screenName: true }
			})
			const actives = !activeResult.status.error && activeResult.result ? activeResult.result : []
			const activesByName = new Map<string, (typeof actives)[number][]>()
			for (const row of actives) {
				const list = activesByName.get(row.screenName) ?? []
				list.push(row)
				activesByName.set(row.screenName, list)
			}
			const tasks: Promise<unknown>[] = []
			winners.forEach((winner, name) => {
				const current = activesByName.get(name) ?? []
				for (const row of current) {
					if (row.id === winner.id) continue
					tasks.push(this.dao.update(row.id, { isActive: false }))
				}
				if (!winner.isActive) tasks.push(this.dao.update(winner.id, { isActive: true }))
				log.debug('activated scheduled screen', 'AppScreensService/activateScheduled', {
					screenName: name,
					jsonVersion: winner.jsonVersion,
					date: targetDate
				})
			})
			await Promise.all(tasks)
			log.info('activated scheduled screens', 'AppScreensService/activateScheduled', {
				date: targetDate,
				count: winners.size
			})
			return new Result(false, ErrorCode.Success, 'Scheduled screens activated', {
				date: targetDate,
				count: winners.size
			})
		} catch (error) {
			log.error('error activating scheduled screens', 'AppScreensService/activateScheduled', error)
			return new Result(true, ErrorCode.InternalServerError, 'Error activating scheduled screens')
		}
	}

	async expireScheduled(today?: string) {
		try {
			const targetDate = (today ?? new Date().toISOString()).slice(0, 10)
			const expiredResult = await this.dao.readMany({
				where: { scheduleEndDate: LessThan(targetDate), isActive: true },
				nonPaginated: true,
				select: { id: true, screenName: true }
			})
			const rows = !expiredResult.status.error && expiredResult.result ? expiredResult.result : []
			if (rows.length === 0) {
				log.info('no expired schedules', 'AppScreensService/expireScheduled', { date: targetDate })
				return new Result(false, ErrorCode.Success, 'Expired schedules cleared', {
					date: targetDate,
					expired: 0,
					restored: 0
				})
			}
			const names: string[] = []
			for (const row of rows) {
				if (!names.includes(row.screenName)) names.push(row.screenName)
			}
			const fallbackResult = await this.dao.readMany({
				where: { screenName: In(names), scheduleStartDate: IsNull() },
				nonPaginated: true,
				select: { id: true, screenName: true, jsonVersion: true }
			})
			const fallbacks =
				!fallbackResult.status.error && fallbackResult.result ? fallbackResult.result : []
			const best = new Map<string, (typeof fallbacks)[number]>()
			const bestJson = new Map<string, number[]>()
			for (const row of fallbacks) {
				const json = this.parseVersion(row.jsonVersion)
				if (!json) continue
				const prev = bestJson.get(row.screenName)
				if (!prev || this.compareVersions(json, prev) > 0) {
					best.set(row.screenName, row)
					bestJson.set(row.screenName, json)
				}
			}
			const tasks: Promise<unknown>[] = []
			const restoredScreens: string[] = []
			for (const row of rows) {
				tasks.push(this.dao.update(row.id, { isActive: false }))
				const fallback = best.get(row.screenName)
				if (fallback && fallback.id !== row.id && !restoredScreens.includes(fallback.id)) {
					tasks.push(this.dao.update(fallback.id, { isActive: true }))
					restoredScreens.push(fallback.id)
					log.debug(
						'schedule ended, restored latest non-scheduled screen',
						'AppScreensService/expireScheduled',
						{
							screenName: row.screenName,
							jsonVersion: fallback.jsonVersion,
							date: targetDate
						}
					)
				} else if (!fallback || fallback.id === row.id) {
					log.warn(
						'schedule ended with no non-scheduled fallback, cleared isLatest',
						'AppScreensService/expireScheduled',
						{ screenName: row.screenName, date: targetDate }
					)
				}
			}
			await Promise.all(tasks)
			log.info('expired scheduled screens', 'AppScreensService/expireScheduled', {
				date: targetDate,
				expired: rows.length,
				restored: restoredScreens.length
			})
			return new Result(false, ErrorCode.Success, 'Expired schedules cleared', {
				date: targetDate,
				expired: rows.length,
				restored: restoredScreens.length
			})
		} catch (error) {
			log.error('error expiring scheduled screens', 'AppScreensService/expireScheduled', error)
			return new Result(true, ErrorCode.InternalServerError, 'Error expiring scheduled screens')
		}
	}

	async getLatestScreen(screenName: string, appVersion: string) {
		try {
			const requested = this.parseVersion(appVersion)
			if (!requested) {
				log.warn('invalid appVersion', 'AppScreensService/getLatestScreen', { appVersion })
				return new Result(true, ErrorCode.BadRequest, 'appVersion must be in x.y.z format')
			}
			const activeResult = await this.dao.readMany({
				where: { screenName, isActive: true },
				nonPaginated: true
			})
			const rows = !activeResult.status.error && activeResult.result ? activeResult.result : []
			let matched: AppScreens | null = null
			let matchedMin: number[] | null = null
			for (const row of rows) {
				const rowMin = this.parseVersion(row.minAppVersion)
				if (!rowMin) continue
				if (this.compareVersions(rowMin, requested) > 0) continue
				if (row.maxAppVersion) {
					const rowMax = this.parseVersion(row.maxAppVersion)
					if (!rowMax) continue
					if (this.compareVersions(requested, rowMax) > 0) continue
				}
				if (!matchedMin || this.compareVersions(rowMin, matchedMin) > 0) {
					matched = row
					matchedMin = rowMin
				}
			}
			if (!matched) {
				log.debug('screen not found for version', 'AppScreensService/getLatestScreen', {
					screenName,
					appVersion
				})
				return new Result(true, ErrorCode.NotFound, 'screen not found for app version')
			}
			return new Result(false, ErrorCode.Success, 'screen found', matched)
		} catch (error) {
			log.error('error getting latest screen', 'AppScreensService/getLatestScreen', error, {
				screenName,
				appVersion
			})
			return new Result(true, ErrorCode.InternalServerError, 'Error getting latest screen')
		}
	}

	async prepareRange(screenName: string, minAppVersion: string, maxAppVersion?: string) {
		const newMin = this.parseVersion(minAppVersion)
		if (!newMin) {
			log.warn('invalid minAppVersion', 'AppScreensService/prepareRange', { minAppVersion })
			return new Result(true, ErrorCode.BadRequest, 'minAppVersion must be in x.y.z format')
		}
		const normalizedMin = `${newMin[0]}.${newMin[1]}.${newMin[2]}`
		let newMaxParsed: number[] | null = null
		let normalizedMax: string | undefined = undefined
		if (maxAppVersion) {
			newMaxParsed = this.parseVersion(maxAppVersion)
			if (!newMaxParsed) {
				log.warn('invalid maxAppVersion', 'AppScreensService/prepareRange', { maxAppVersion })
				return new Result(true, ErrorCode.BadRequest, 'maxAppVersion must be in x.y.z format')
			}
			if (this.compareVersions(newMin, newMaxParsed) > 0) {
				log.warn('minAppVersion greater than maxAppVersion', 'AppScreensService/prepareRange', {
					minAppVersion,
					maxAppVersion
				})
				return new Result(
					true,
					ErrorCode.BadRequest,
					'minAppVersion cannot be greater than maxAppVersion'
				)
			}
			normalizedMax = `${newMaxParsed[0]}.${newMaxParsed[1]}.${newMaxParsed[2]}`
		}
		const activeResult = await this.dao.readMany({
			where: { screenName, isActive: true },
			nonPaginated: true,
			select: { id: true, minAppVersion: true, maxAppVersion: true }
		})
		const rows = activeResult.result ?? []
		const bands: { id: string; min: number[]; max: number[] | null }[] = []
		let nextMin: number[] | null = null
		let nextMinRaw: string | null = null
		for (const row of rows) {
			const min = this.parseVersion(row.minAppVersion)
			if (!min) continue
			let max: number[] | null = null
			if (row.maxAppVersion) {
				max = this.parseVersion(row.maxAppVersion)
				if (!max) continue
			}
			bands.push({ id: row.id, min, max })
			if (
				this.compareVersions(min, newMin) > 0 &&
				(!nextMin || this.compareVersions(min, nextMin) < 0)
			) {
				nextMin = min
				nextMinRaw = row.minAppVersion
			}
		}
		let effectiveMax = normalizedMax
		let effectiveMaxParsed: number[] | null = newMaxParsed
		if (!effectiveMax && nextMin && nextMinRaw) {
			const capped = this.decrementVersion(nextMinRaw)
			const cappedParsed = capped ? this.parseVersion(capped) : null
			if (!capped || !cappedParsed) {
				log.warn('cannot cap unbounded range', 'AppScreensService/prepareRange', {
					screenName,
					minAppVersion,
					nextMin: nextMinRaw
				})
				return new Result(true, ErrorCode.BadRequest, 'cannot deploy unbounded range before 0.0.0')
			}
			if (this.compareVersions(newMin, cappedParsed) > 0) {
				log.warn('new range is empty after capping', 'AppScreensService/prepareRange', {
					screenName,
					minAppVersion,
					nextMin: nextMinRaw
				})
				return new Result(
					true,
					ErrorCode.BadRequest,
					'new range is empty, a higher active range already covers it'
				)
			}
			effectiveMax = capped
			effectiveMaxParsed = cappedParsed
			log.debug('capped unbounded deploy to next range', 'AppScreensService/prepareRange', {
				screenName,
				minAppVersion,
				effectiveMax,
				nextMin: nextMinRaw
			})
		}
		return new Result(true, ErrorCode.Success, 'prepared range', {
			bands,
			newMin,
			normalizedMin,
			effectiveMax,
			effectiveMaxParsed
		})
	}

	async applyOverlapResolution(
		screenName: string,
		bands: { id: string; min: number[]; max: number[] | null }[],
		newMin: number[],
		normalizedMin: string,
		effectiveMaxParsed: number[] | null
	) {
		const deactivateIds: string[] = []
		const truncateIds: string[] = []
		let truncatedMax: string | null = null
		let truncatedParsed: number[] | null = null
		for (const band of bands) {
			if (effectiveMaxParsed && this.compareVersions(band.min, effectiveMaxParsed) > 0) continue
			if (band.max && this.compareVersions(band.max, newMin) < 0) continue
			if (this.compareVersions(band.min, newMin) >= 0) {
				deactivateIds.push(band.id)
				continue
			}
			if (!truncatedMax) {
				truncatedMax = this.decrementVersion(normalizedMin)
				truncatedParsed = truncatedMax ? this.parseVersion(truncatedMax) : null
				if (!truncatedMax || !truncatedParsed) {
					log.warn(
						'cannot truncate below 0.0.0, deactivating instead',
						'AppScreensService/applyOverlapResolution',
						{ screenName }
					)
					truncatedMax = null
					truncatedParsed = null
				}
			}
			if (
				!truncatedMax ||
				!truncatedParsed ||
				this.compareVersions(band.min, truncatedParsed) > 0
			) {
				deactivateIds.push(band.id)
			} else {
				truncateIds.push(band.id)
			}
		}
		const tasks: Promise<unknown>[] = []
		for (const id of deactivateIds) {
			log.debug('deactivated overlapped screen', 'AppScreensService/applyOverlapResolution', {
				screenName,
				id
			})
			tasks.push(this.dao.update(id, { isActive: false }))
		}
		if (truncateIds.length > 0 && truncatedMax) {
			for (const id of truncateIds) {
				log.debug('truncated overlapped screen max', 'AppScreensService/applyOverlapResolution', {
					screenName,
					id,
					maxAppVersion: truncatedMax
				})
				tasks.push(this.dao.update(id, { maxAppVersion: truncatedMax }))
			}
		}
		const results = await Promise.all(tasks)
		for (const res of results) {
			const result = res as Result<unknown>
			if (result && result.status && result.status.error) {
				log.warn('overlap update failed', 'AppScreensService/applyOverlapResolution', {
					screenName,
					result
				})
			}
		}
	}

	parseVersion(version: string) {
		const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim())
		if (!match) return null
		return [Number(match[1]), Number(match[2]), Number(match[3])]
	}

	compareVersions(a: number[], b: number[]) {
		for (let i = 0; i < 3; i++) {
			if (a[i] < b[i]) return -1
			if (a[i] > b[i]) return 1
		}
		return 0
	}

	decrementVersion(version: string) {
		const parsed = this.parseVersion(version)
		if (!parsed) return null
		let [major, minor, patch] = parsed
		if (patch > 0) {
			patch -= 1
		} else if (minor > 0) {
			minor -= 1
			patch = 99
		} else if (major > 0) {
			major -= 1
			minor = 99
			patch = 99
		} else {
			return null
		}
		return `${major}.${minor}.${patch}`
	}
}

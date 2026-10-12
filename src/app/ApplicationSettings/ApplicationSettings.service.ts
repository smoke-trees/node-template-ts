import { Service } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { ApplicationSettingsDao } from './ApplicationSettings.dao'
import { ApplicationSettings } from './ApplicationSettings.entity'
import { SettingTypes } from './IApplicationSettings'

export class ApplicationSettingsService extends Service<ApplicationSettings> {
	dao: ApplicationSettingsDao
	settings: any
	constructor(
		@inject(ApplicationSettingsDao)
		dao: ApplicationSettingsDao
	) {
		super(dao)
		this.dao = dao
		this.settings = {} as any
	}

	async loadSettings() {
		const settings = await this.dao.readMany()
		settings.result?.forEach((setting) => {
			this.settings[setting.name] = setting.value
		})
		// eslint-disable-next-line no-console
		console.log(this.settings)
	}

	async getValue(key: string) {
		const value = this.settings[key]
		if (value) {
			return value
		} else {
			const setting = await this.dao.read({ where: { name: key } })
			if (setting.result) {
				return setting.result.value
			} else {
				return null
			}
		}
	}

	async setValue(key: string, value: any, type: SettingTypes) {
		const setting = await this.dao.read({ where: { name: key } })
		if (setting.result) {
			setting.result.value = value
			setting.result.type = type
			setting.result.updatedAt = new Date()
			return this.dao.update(setting.result.id, setting.result)
		} else {
			return this.dao.create({ name: key, value, type })
		}
	}
}

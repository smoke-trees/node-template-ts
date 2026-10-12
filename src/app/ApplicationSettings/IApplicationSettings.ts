import { Optional } from "../../types"

export enum SettingTypes {
	STRING = 'string',
	NUMBER = 'number',
	BOOLEAN = 'boolean',
	JSON = 'json',
	ARRAY = 'array'
}

export interface IApplicationSettings {
	id: string
	name: string
	value: string
	type: SettingTypes
	isPublic: boolean
}

export type IApplicationSettingsCreate = Optional<IApplicationSettings, 'id'>
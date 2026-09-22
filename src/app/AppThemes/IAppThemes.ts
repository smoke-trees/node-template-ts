export interface IAppThemes {
	id: string
	themeName: string
	themeJson: string
	version: number
	isLatest: boolean
	scheduleStartDate?: string
	scheduleEndDate?: string
	lastDeployed: string
	supportedAppVersion?: string
}

export interface IAppThemes {
	id: string
	themeName: string
	themeJson: string
	jsonVersion: string
	isActive: boolean
	scheduleStartDate?: string
	scheduleEndDate?: string
	lastDeployed: string
	minAppVersion: string
	maxAppVersion?: string
	versionNote?: string
}

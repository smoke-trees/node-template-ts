export interface IAppScreens {
	id: string
	screenName: string
	screenJson: string
	jsonVersion: string
	isActive: boolean
	scheduleStartDate?: string
	scheduleEndDate?: string
	lastDeployed: string
	minAppVersion: string
	maxAppVersion?: string
	versionNote?: string
}

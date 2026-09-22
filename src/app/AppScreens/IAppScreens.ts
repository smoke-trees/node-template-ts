export interface IAppScreens {
	id: string
	screenName: string
	screenJson: string
	version: number
	isLatest: boolean
	scheduleStartDate?: string
	scheduleEndDate?: string
	lastDeployed: string
	supportedAppVersion?: string
}

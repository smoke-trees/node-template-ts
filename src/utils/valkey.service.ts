import { GlideClient } from '@valkey/valkey-glide'
import { Result, ErrorCode } from '@smoke-trees/postgres-backend'
import { log } from '../log'
import settings from '../settings'

export class ValkeyService {
	private client: GlideClient | null = null

	async connect(): Promise<Result<boolean>> {
		try {
			if (this.client) {
				log.warn('Valkey client already connected', 'ValkeyService.connect', {})
				return new Result(false, ErrorCode.Success, 'Valkey client already connected', true)
			}
			const addresses = [{ host: settings.valkeyHost, port: settings.valkeyPort }]
			const credentials =
				settings.valkeyPassword ?
					{
						...(settings.valkeyUsername && { username: settings.valkeyUsername }),
						password: settings.valkeyPassword
					}
				:	undefined
			this.client = await GlideClient.createClient({
				addresses,
				credentials,
				clientName: 'backend-service',
				databaseId: settings.valkeyDatabaseId
			})
			log.info('Connected to Valkey', 'ValkeyService.connect', {
				host: settings.valkeyHost,
				port: settings.valkeyPort
			})
			return new Result(false, ErrorCode.Success, 'Connected to Valkey', true)
		} catch (error) {
			log.error('Failed to connect to Valkey', 'ValkeyService.connect', error as Error, {
				host: settings.valkeyHost,
				port: settings.valkeyPort
			})
			throw new Result(true, ErrorCode.InternalServerError, 'Failed to connect to Valkey', false)
		}
	}

	async close(): Promise<Result<boolean>> {
		try {
			if (!this.client) {
				return new Result(false, ErrorCode.Success, 'Valkey client already disconnected', true)
			}
			this.client.close()
			this.client = null
			log.info('Disconnected from Valkey', 'ValkeyService.close', {})
			return new Result(false, ErrorCode.Success, 'Disconnected from Valkey', true)
		} catch (error) {
			log.error('Failed to close Valkey connection', 'ValkeyService.close', error as Error, {})
			return new Result(
				true,
				ErrorCode.InternalServerError,
				'Failed to close Valkey connection',
				false
			)
		}
	}
}

export const valkeyService = new ValkeyService()

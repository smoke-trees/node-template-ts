import { config } from 'dotenv'
import path from 'path'

config()

config({ path: path.resolve(process.cwd(), '.env.local') })

if (process.env.NODE_ENV?.toLowerCase() === 'production') {
	config({ path: path.resolve(process.cwd(), '.env.production') })
}

if (process.env.NODE_ENV?.toLowerCase() === 'ci' || process.env.CI?.toLowerCase() === 'true') {
	config({ path: path.resolve(process.cwd(), '.env.test') })
}

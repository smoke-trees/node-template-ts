import morgan from 'morgan'
import logger from './logger'
import { Logger } from 'winston'

const logStream = {
  write: (message: string): Logger => logger.info(message)
}

const log = morgan('common', { stream: logStream })

export default log

import morgan from 'morgan'
import logger from './log'
import { Logger } from 'winston'

const logStream = {
  write: (message: string): Logger => logger.logger.info(message)
}

const log = morgan('common', { stream: logStream })

export default log

import { createLogger, format, Logger, transports } from 'winston'
import rTracer from 'cls-rtracer'
import { ContextType } from '@smoke-trees/smoke-context'

const rTracerFormat = format((info) => {
  const rid = rTracer.id()
  info.message = rid ? `[request-id: ${rid}]: ${info.message}` : info.message
  return info
})

const wTransports = [
  new transports.Console({
    level: 'silly',
    handleExceptions: true,
    format: process.env.NODE_ENV === 'production'
      ? format.combine(rTracerFormat(), format.json(), format.timestamp())
      : format.combine(rTracerFormat(), format.colorize(), format.simple())
  })
]

const logger = createLogger({
  level: 'silly',
  format: format.combine(rTracerFormat(), format.simple()),
  transports: wTransports
})

class CustomLogger {
  private _logger: Logger

  public get logger (): Logger {
    return this._logger
  }

  public set logger (value: Logger) {
    this._logger = value
  }

  constructor (logger: Logger) {
    this._logger = logger
  }

  info (message: string, functionName?: string, context?: ContextType, ...meta: any[]): void {
    this._logger.info(message, { traceId: context?.traceId, functionName, ...meta })
  }

  debug (message: string, functionName?: string, context?: ContextType, ...meta: any[]): void {
    this._logger.debug(message, { traceId: context?.traceId, functionName, ...meta })
  }

  trace (message: string, functionName?: string, context?: ContextType, ...meta: any[]): void {
    this._logger.error(message, { traceId: context?.traceId, functionName, ...meta })
  }

  error (message: string, functionName?: string, context?: ContextType, error?: unknown, ...meta: any[]): void {
    this._logger.error(message, {
      traceId: context?.traceId,
      error: error instanceof Error && error.stack,
      functionName,
      ...meta
    })
  }

  warn (message: string, functionName?: string, context?: ContextType, ...meta: any[]): void {
    this._logger.warn(message, { traceId: context?.traceId, functionName, ...meta })
  }

  fatal (message: string, functionName?: string, context?: ContextType, ...meta: any[]): void {
    this._logger.error(message, { traceId: context?.traceId, functionName, ...meta })
  }
}

export default new CustomLogger(logger)

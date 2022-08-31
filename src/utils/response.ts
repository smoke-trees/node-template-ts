import { IResult, ErrorCodes } from '../IResult'

export function getStatus<T>(result: IResult<T>): number {
  switch (result.error.code) {
    case ErrorCodes.Success: {
      return 200
    }
    default: {
      return 500
    }
  }
}

interface Response<T> {
  error: boolean
  code: ErrorCodes
  message?: string | undefined
  result: T | IResult<T> | null
}

export function parseResult<T>(result: IResult<T>): Response<T> {
  const error = { ...result.error }

  return { result, ...result, ...error }
}

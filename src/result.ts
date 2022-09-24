export enum ErrorCode {
  Success = '200',
  Created = '201',
  BadRequest = '400',
  NotAuthorized = '401',
  NotFound = '404',
  NoUpdatesPerformed = '405',
  InternalServerError = '500',
  DatabaseError = '500'
}


export function getStatus<T>(result: IResult<T>): number {
  switch(result.status.code) {
    case ErrorCode.Success:
    case ErrorCode.NoUpdatesPerformed:
      return 200;
    case ErrorCode.Created:
      return 201;
    case ErrorCode.BadRequest:
      return 400;
    case ErrorCode.NotAuthorized:
      return 401;
    case ErrorCode.NotFound:
      return 404;
    case ErrorCode.InternalServerError:
      return 500;
    case ErrorCode.DatabaseError:
      return 500;
    default:
      throw new Error("Invalid status code");
  }
}

export interface IResult<T> {
  status: {
    code: ErrorCode;
    error: boolean;
  };
  message?: string;
  result?: T | null;
}

export type WithCount<T> = T & { count: number | null }

export class Result<T> implements IResult<T> {

  status: { code: ErrorCode; error: boolean; };
  message?: string;
  result?: T | null

  constructor(status: { code: ErrorCode, error: boolean }, message?: string, result?: T) {
    this.status = status;
    this.message = message;
    this.result = result ?? null
  }

  getStatus(): number {
    return parseInt(this.status.code, 10)
  }
}
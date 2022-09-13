export enum ErrorCode {
  Success = '200',
  Created = '201',
  BadRequest = '400',
  NotAuthorized = '401',
  NotFound = '404',
  NoUpdatesPerformed = '405',
  UnknownServerError = '500',
  DatabaseError = '500'
}


export function getStatus<T>(result: IResult<T>): number {
  return parseInt(result.status.code, 10)
}

export interface IResult<T> {
  status: {
    code: ErrorCode;
    error: boolean;
  };
  message?: string;
  result?: T | null;
}

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
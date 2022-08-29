export enum ErrorCodes {
    Success = '200',
    Created = '201',
    BadRequest = '400',
    NotAuthorized = '401',
    NotFound = '404',
    NoUpdatesPerformed = '1002',
    UnknownServerError = '500',
    BrandDeactivated = '1003',
    BrandNotFound = '1004',
    InvalidOrderId = '1005',
    InsufficientBalance = '1006',
    DatabaseError = '1007'
  }
  
  
  
  export interface IResult<T> {
    error: {
      code: ErrorCodes;
      error: boolean;
    };
    message?: string;
    result?: T | null;
  }
  
  export class Result<T> implements IResult<T> {
  
    error: { code: ErrorCodes; error: boolean; };
    message?: string | undefined;
    result?: T | null
  
    constructor(error: boolean, code: ErrorCodes, message: string, result?: T) {
      this.error = {
        error,
        code
      };
      this.message = message;
      this.result = result ?? null
    }
  }
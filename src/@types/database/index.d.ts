import { ErrorCodes } from '../model'

export interface DatabaseResult {
  errorCode: ErrorCodes;
  message: string;
}

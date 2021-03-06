import { ObjectId } from 'mongodb'

export interface ModelResponse {
  errorCode: ErrorCodes;
  message: string;
  insertId?: ObjectId;
  upsertId?: ObjectId;
  updateId?: string;
  deleteId?: string;
}

export const enum ErrorCodes {
    Success = '200',
    Created = '201',
    FieldsMissing = '400',
    NotAuthorized = '401',
    NotFound = '404',
    NoUpdatesPerformed = '1002',
    UnkownServerError = '500'
  }
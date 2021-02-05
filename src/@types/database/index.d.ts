import { PoolClient, QueryResult } from 'pg'
import { ErrorCodes } from '../model'

/* eslint  @typescript-eslint/no-explicit-any:"off" */
export interface Database {
  getClient: () => Promise<PoolClient>;
  query: (text: string, params?: any) => Promise<QueryResult<any>>;
}

export interface DatabaseResult {
  errorCode: ErrorCodes;
  message: string;
}

export interface ModelResponse {
  errorCode: ErrorCodes;
  message: string;
  insertId?: number | string;
  upsertId?: number | string;
  updateId?: number | string;
  deleteId?: number | string;
}

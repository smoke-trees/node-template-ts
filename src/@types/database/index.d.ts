import { PoolClient, QueryResult } from 'pg'

/* eslint  @typescript-eslint/no-explicit-any:"off" */
export interface Database {
  getClient: () => Promise<PoolClient>;
  query: (text: string, params?: any) => Promise<QueryResult<any>>;
}

export interface InjectorInterface {
  database: Database;
}

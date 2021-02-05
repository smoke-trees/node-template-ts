import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
import { ErrorCodes } from '../model'

export interface DatabaseObjectInterface {
  connection: MongoClient;
  db: Db;
}

export interface DatabaseResult {
  errorCode: ErrorCodes;
  message: string;
  insertId?: ObjectId;
  upsertId?: ObjectId;
  updatedId?: string;
  deletedId?: string;
}

export interface Database {
  connection: Promise<DatabaseObjectInterface>;
}

export interface InjectorInterface {
  database: Database;
}

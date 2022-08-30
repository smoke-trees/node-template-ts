import fs from 'fs';
import path from 'path';

import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm';
import settings from './settings'
import log from './log';
import { ConsumerEntity } from '../database/entities/Consumer';
import { ConsultantEntity } from '../database/entities/Consultant';
import { GeneratorEntity } from '../database/entities/Generator';
import { UserEntity } from '../database/entities/User';


class Database {
  private connection!: Connection;
  private connectionName: string | undefined;
  private _ready: Promise<boolean>;

  get ready(): Promise<boolean> {
    return this._ready
  }

  constructor() {
    this.connectionName = settings.connectionName;
    this._ready = new Promise(async (resolve, reject) => {
      try {
        await this.connect();
        resolve(true)
      } catch (error) {
        reject(false)
      }
    })
  }

  async connect(): Promise<boolean> {
    try {
      log.info("initializing database")
      const connection = await createConnection(this.getConfig()).then(connection => {
        log.info('Database connected');
        return connection
      })
      this.connection = connection
      return true
    } catch (error) {
      log.error("Error in connecting to database", "Database/connect", error)
      return false
    }
  }

  async getConnection(): Promise<Connection> {
    if (!this.connection) {
      throw new Error('Database not connected')
    }
    const client = getConnection(this.connectionName)
    return client
  }



  getConfig(): ConnectionOptions {
    const config: ConnectionOptions = {
      type: 'postgres',
      port: 5432,
      ssl: process.env.NODE_ENV === 'production'
        ? {
          ca: fs.readFileSync(path.resolve(__dirname, '..', '..', 'ca.cert'))
        }
        : undefined,
      name: this.connectionName,
      database: settings.pgDatabase,
      host: settings.pgHost,
      username: settings.pgUser,
      password: settings.pgPassword,
      entities: [
        ConsumerEntity, ConsultantEntity, GeneratorEntity, UserEntity,
      ],
      synchronize: true,
      migrationsRun: false,
      migrations: [],
      logging: ['error', 'warn', 'info']
      // logging: ['error', 'migration', 'query', 'schema', 'warn', 'info']
    }
    return config
  }
}


export default Database

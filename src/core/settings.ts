interface SettingsInterface {
  port: string;
  connectionName: String;
  getValue(key: string, defaultValue?: string): string | undefined;
}

export class Settings implements SettingsInterface {
  port: string
  staging: boolean;
  connectionName: string;
  pgHost: string;
  pgPassword: string;
  pgDatabase: string;
  pgUser: string;
  interceptors: boolean;

  constructor() {
    this.port = process.env.port ?? '8080'
    this.staging = this.getValue('NODE_ENV') !== 'production'
    this.interceptors = true
    this.connectionName = 'default'
    this.pgHost = this.getValue('PGHOST', 'localhost')
    this.pgPassword = this.getValue('PGPASSWORD', 'earnest1234')
    this.pgDatabase = this.getValue('PGDATABASE', 'bwdb')
    this.pgUser = this.getValue('PGUSER', 'bwdbuser')
  }

  getValue(key: string, defaultValue: string): string;
  getValue(key: string): string | undefined;
  getValue(key: string, defaultValue?: string): string | undefined {
    return (process.env[key] ?? defaultValue)
  }
}
export default new Settings()
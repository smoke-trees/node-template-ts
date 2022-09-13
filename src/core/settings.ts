interface SettingsInterface {
  port: string;
  connectionName: String;
  getValue(key: string, defaultValue?: string): string | undefined;
}

export class Settings implements SettingsInterface {
  port: string
  connectionName: string;
  pgHost: string;
  pgPassword: string;
  pgDatabase: string;
  pgPort: string;
  pgUser: string;
  interceptors: boolean;

  constructor() {
    this.port = this.getValue('PORT', '8080')
    this.interceptors = true
    this.connectionName = 'default'
    this.pgHost = this.getValue('PGHOST', 'localhost')
    this.pgPassword = this.getValue('PGPASSWORD', 'mysecretpassword')
    this.pgDatabase = this.getValue('PGDATABASE', 'postgres')
    this.pgPort = this.getValue('PGPORT', '5432')
    this.pgUser = this.getValue('PGUSER', 'postgres')
  }

  getValue(key: string, defaultValue: string): string;
  getValue(key: string): string | undefined;
  getValue(key: string, defaultValue?: string): string | undefined {
    return (process.env[key] ?? defaultValue)
  }
}
export default new Settings()
interface SettingsInterface {
  port: string;
  connectionName: String;
  getValue(key: string, defaultValue?: string): string | undefined;
}

export class Settings implements SettingsInterface {
  port: string
  connectionName: string;

  constructor() {
    this.port = process.env.PORT ?? '8080'
    this.connectionName = process.env.CONNECTION_NAME ?? 'default'
  }

  getValue(key: string, defaultValue?: string): string | undefined {
    return (process.env[key] ?? defaultValue)
  }
}

export default new Settings()
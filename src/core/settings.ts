interface SettingsInterface {
  port: string;
  getValue(key: string, defaultValue?: string): string | undefined;
}
export default class Settings implements SettingsInterface {
  port: string

  constructor () {
    this.port = process.env.port ?? '8080'
  }

  getValue (key: string, defaultValue?: string): string | undefined {
    return (process.env[key] ?? defaultValue)
  }
}

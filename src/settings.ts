import { Settings } from "@smoke-trees/postgres-backend";

export class ApplicationSettings extends Settings {
  constructor() {
    super();
    this.pgDatabase = 'test_demo'
  }
}

const settings = new ApplicationSettings();

export default settings;
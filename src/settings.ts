import { Settings } from "@smoke-trees/postgres-backend";

export class ApplicationSettings extends Settings {
  constructor() {
    super();
  }
}

const settings = new ApplicationSettings();

export default settings;
import { Settings } from "./core/settings";

export class ApplicationSettings extends Settings {
  constructor() {
    super();
  }
}

const settings = new ApplicationSettings();

export default settings;
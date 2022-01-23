const { readFile } = require("fs").promises;
const { watch } = require("fs");

export default class ConfigService {
  private watcher = null;
  private configFile = "";

  constructor(filepath = __dirname + "/config/server.json") {
    this.configFile = filepath;
  }

  // get config file in json format
  public getConfigFileData = async () => {
    const data = await readFile(this.configFile);
    const config = JSON.parse(data);
    return config;
  };

  // get single property of the config file
  public getConfigFileProperty = async (property) => {
    const data = await this.getConfigFileData();
    return data[property];
  };

  // run handler on config file change
  public onConfigFileChange = (changeHandler) => {
    this.watcher = watch(this.configFile, (eventType) => {
      if (eventType == "change") {
        changeHandler();
      }
    });
  };

  // stop watching config file for changes
  public stopWatch = () => {
    if (this.watcher) {
      this.watcher.close();
    }
  };
}

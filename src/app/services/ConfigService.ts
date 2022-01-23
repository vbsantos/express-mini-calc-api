const { readFile } = require("fs").promises;
const { watch } = require("fs");

export default class ConfigService {
  private watcher = null;
  private configFile = "";

  constructor(filepath = __dirname + "/config/server.json") {
    this.configFile = filepath;
  }

  public getConfigFileData = async () => {
    const data = await readFile(this.configFile);
    const config = JSON.parse(data);
    return config;
  };

  public getConfigFileProperty = async (property) => {
    const data = await this.getConfigFileData();
    return data[property];
  };

  public onConfigFileChange = (changeHandler) => {
    this.watcher = watch(this.configFile, (eventType) => {
      if (eventType == "change") {
        changeHandler();
      }
    });
  };

  public stopWatch = () => {
    if (this.watcher) {
      this.watcher.close();
    }
  };
}

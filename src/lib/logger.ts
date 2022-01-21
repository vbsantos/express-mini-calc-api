const { writeFile, appendFile } = require("fs").promises;
import { getConfigFileProperty } from "./utils";

export default class Logger {
  private logFilePath;
  private logFileTimestamp;

  constructor(folder = "logs") {
    this.logFilePath = folder;
  }

  public async log(data) {
    const hasToCreateNextLogFile = await this.hasToCreateNextlogFile();
    const isFirstLogFile = !this.logFileTimestamp;
    if (hasToCreateNextLogFile || isFirstLogFile) {
      const header = Object.keys(data);
      this.createLogFile(header);
    }
    this.writeLogFile(data);
  }

  private async hasToCreateNextlogFile() {
    const logFileCreatedAt = new Date(this.logFileTimestamp);
    const now = new Date();
    const diff = Math.abs(Number(now) - Number(logFileCreatedAt)) / 1000 / 60;
    const configuredTime = await this.getConfiguredTime();
    return diff > configuredTime;
  }

  private getLogFileName() {
    return `${this.logFilePath}/${new Date(
      this.logFileTimestamp
    ).toISOString()}.csv`;
  }

  private async writeLogFile(data) {
    await appendFile(
      this.getLogFileName(),
      `${Object.values(data).join(",")};\n`
    );
  }

  private async createLogFile(header) {
    this.logFileTimestamp = Number(new Date());
    await writeFile(this.getLogFileName(), `${header.join(",")};\n`, "utf-8");
    return this.getLogFileName();
  }

  private async getConfiguredTime() {
    const minutesBetweenLogFiles = await getConfigFileProperty(
      "minutesBetweenLogFiles"
    );
    return minutesBetweenLogFiles;
  }
}

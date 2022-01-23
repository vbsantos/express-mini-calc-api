const path = require('path');
const { writeFile, appendFile } = require("fs").promises;

export default class LoggerService {
  private logFilePath;
  private logFileTimestamp;
  private timeIntervalInMinutes;

  constructor(filepath = __dirname + "/../logs", timeIntervalInMinutes = 60) {
    this.logFilePath = filepath;
    this.timeIntervalInMinutes = timeIntervalInMinutes;
  }

  // set the lifespan of each log file
  public setTimeIntervalInMinutes = (timeIntervalInMinutes) => {
    this.timeIntervalInMinutes = timeIntervalInMinutes;
  };

  // log json data in csv format
  public log = async (data) => {
    if (!data) {
      return null;
    }
    let filename;
    const hasToCreateNextLogFile = await this.hasToCreateNextlogFile();
    const isFirstLogFile = !this.logFileTimestamp;
    if (hasToCreateNextLogFile || isFirstLogFile) {
      const header = Object.keys(data);
      filename = await this.createLogFile(header);
    }
    await this.writeLogFile(data);
    return filename;
  };

  private hasToCreateNextlogFile = async () => {
    const logFileCreatedAt = new Date(this.logFileTimestamp);
    const now = new Date();
    const diff = Math.abs(Number(now) - Number(logFileCreatedAt)) / 1000 / 60;
    const configuredTime = this.timeIntervalInMinutes;
    return diff > configuredTime;
  };

  private getLogFileName = () => {
    const isoString = new Date(this.logFileTimestamp).toISOString();
    return path.resolve(this.logFilePath, `${isoString}.csv`);
  };

  private writeLogFile = async (data) => {
    await appendFile(
      this.getLogFileName(),
      `${Object.values(data).join(",")};\n`
    );
  };

  private createLogFile = async (header) => {
    this.logFileTimestamp = +new Date();
    await writeFile(this.getLogFileName(), `${header.join(",")};\n`, "utf-8");
    return this.getLogFileName();
  };
}

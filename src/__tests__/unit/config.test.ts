import ConfigService from "../../app/services/ConfigService";
const { mkdir, rm, writeFile } = require("fs").promises;

describe("Config", () => {
  const configDirectory = "./test-config";
  const configFileName = "config.json";
  const configFilePath = `${configDirectory}/${configFileName}`;
  const configData = {
    teste1: 1,
    teste2: 2,
    teste3: 3,
    teste4: 4,
    teste5: 5,
  };
  let configService;

  beforeAll(async () => {
    // create mock config file
    await mkdir(configDirectory);

    await writeFile(configFilePath, JSON.stringify(configData));
    configService = new ConfigService(configFilePath);
  });

  afterAll(async () => {
    // delete mock config file
    await rm(configDirectory, { recursive: true, force: true });
  });

  test("Should read config file data", async () => {
    const data = await configService.getConfigFileData();
    expect(JSON.stringify(data)).toBe(JSON.stringify(configData));
  });

  test("Should read config property", async () => {
    const propertyName = "teste2";
    const property = await configService.getConfigFileProperty(propertyName);
    expect(JSON.stringify(property)).toBe(
      JSON.stringify(configData[propertyName])
    );
  });

  test("Shouldn't call handler when config file isn't changed", async () => {
    const mockCallback = jest.fn();
    await configService.onConfigFileChange(mockCallback);
    expect(mockCallback).toBeCalledTimes(0);
    await configService.stopWatch();
  });

  test("Should call handler when config file is changed", async () => {
    const mockCallback = jest.fn();
    await configService.onConfigFileChange(mockCallback);
    await writeFile(configFilePath, JSON.stringify(configData));
    expect(mockCallback).toBeCalled();
    await configService.stopWatch();
  });
});

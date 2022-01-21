const { readFile } = require("fs").promises;
const { watch } = require("fs");

const configFile = "src/config/server.json";

export const onConfigFileChange = (changeHandler) => {
  watch(configFile, (eventType) => {
    if (eventType == "change") {
      changeHandler();
    }
  });
};

const readConfigFile = async () => {
  const data = await readFile(configFile);
  const config = JSON.parse(data);
  return config;
};

export const getConfigFileProperty = async (property) => {
  const data = await readConfigFile();
  return data[property];
};

const { MongoClient, ObjectId } = require("mongodb");
const connectionString = process.env.MONGODB_CONN_STR;
let database;

// CONFIG FILE
import { getConfigFileProperty, onConfigFileChange } from "./utils";
let logQueries;
const setLog = async () => {
  logQueries = await getConfigFileProperty("logQueries");
};
setLog();
onConfigFileChange(setLog);

// LOGGER
import Logger from "./logger";
const logger = new Logger("logs/queries");

export const connectToDatabase = async (databaseName) => {
  const client = await MongoClient.connect(connectionString);
  database = client.db(databaseName);
};

export const insertOperation = async (collectionName, data) => {
  const collection = database.collection(collectionName);
  const operation = await collection.insertOne(data);
  if (logQueries) {
    logger.log({
      timestamp: new Date().toISOString(),
      collection: collectionName,
      query: "insertOne",
      id: operation.insertedId,
      result: data.result,
    });
  }
  return operation;
};

export const getOperationById = async (collectionName, uid) => {
  const data = ObjectId(uid);
  const collection = database.collection(collectionName);
  const operation = await collection.findOne(data);
  if (logQueries) {
    logger.log({
      timestamp: new Date().toISOString(),
      collection: collectionName,
      query: "findOne",
      id: data,
      result: "",
    });
  }
  return operation;
};

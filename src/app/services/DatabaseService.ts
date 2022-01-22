const { MongoClient, ObjectId } = require("mongodb");

export default class DatabaseService {
  private database;

  constructor(private connectionString, private databaseName) {}

  public connectToDatabase = async () => {
    const client = await MongoClient.connect(this.connectionString);
    this.database = client.db(this.databaseName);
  };

  public insertOperation = async (collectionName, data) => {
    const collection = this.database.collection(collectionName);
    const operation = await collection.insertOne(data);
    return {
      timestamp: new Date().toISOString(),
      collection: collectionName,
      query: "insertOne",
      id: operation.insertedId,
      result: data.result,
    };
  };

  public getOperationById = async (collectionName, uid) => {
    const data = ObjectId(uid);
    const collection = this.database.collection(collectionName);
    const operation = await collection.findOne(data);
    return {
      timestamp: new Date().toISOString(),
      collection: collectionName,
      query: "findOne",
      id: data,
      result: operation.result,
    };
  };
}

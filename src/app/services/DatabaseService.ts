const { MongoClient, ObjectId } = require("mongodb");

export default class DatabaseService {
  private connection;
  private database;

  constructor(private connectionString, private databaseName) {}

  // create connection
  public connectToDatabase = async () => {
    this.connection = await MongoClient.connect(this.connectionString);
    this.database = await this.connection.db(this.databaseName);
  };
  
  // close connection
  public close = async () => {
    await this.connection.close();
  }

  // insert data and return custom json ready for logging
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

  // get data and return custom json ready for logging
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

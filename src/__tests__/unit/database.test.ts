const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

import DatabaseService from "../../app/services/DatabaseService";

describe("Database", () => {
  let databaseService;

  beforeAll(async () => {
    databaseService = new DatabaseService(
      process.env.MONGODB_CONN_STR,
      "test-database"
    );
    await databaseService.connectToDatabase();
  });

  afterAll(async () => {
    await databaseService.close();
  });

  test("Should insert data in the database", async () => {
    const operationData = {
      operator_a: 1,
      operator_b: 2,
      operation: "sum",
      result: 3,
    };

    const operation = await databaseService.insertOperation(
      "test-collection",
      operationData
    );

    expect(operation).toHaveProperty("id");
    expect(operation).toHaveProperty("result", 3);
  });

  test("Should fetch data from the database", async () => {
    const operationData = {
      operator_a: 4,
      operator_b: 2,
      operation: "mul",
      result: 8,
    };

    const { id } = await databaseService.insertOperation(
      "test-collection",
      operationData
    );

    const operation = await databaseService.getOperationById(
      "test-collection",
      id
    );

    expect(operation).toHaveProperty("result", 8);
  });
});

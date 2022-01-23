const path = require("path");

import DatabaseService from "../services/DatabaseService";
import ConfigService from "../services/ConfigService";
import LoggerService from "../services/LoggerService";

// DATABASE
const database = new DatabaseService(
  process.env.MONGODB_CONN_STR,
  "minicalculadora"
);

// CONFIG FILE
const config = new ConfigService(path.resolve("src", "config", "server.json"));

// LOGGER
const queryLogger = new LoggerService(path.resolve("logs", "queries"));
const requestLogger = new LoggerService(path.resolve("logs", "requests"));

class OperationController {
  // if true logs all api requests
  private logRequests: boolean;

  // if true logs all database queries
  private logQueries: boolean;

  // each endpoint parameter
  private allOperations = {
    sum: (a: number, b: number): number => a + b,
    sub: (a: number, b: number): number => a - b,
    div: (a: number, b: number): number => a / b,
    mul: (a: number, b: number): number => a * b,
  };

  constructor(private database) {
    this.database.connectToDatabase();
    this.setLogConfig();
    config.onConfigFileChange(this.setLogConfig);
  }

  operation = async (req, res) => {
    const start = +new Date();

    const op: string = req.params.operation;
    const a: number = Number(req.query.a);
    const b: number = Number(req.query.b);

    const clientIp: string = req.ip.split(":").pop();

    let statusCode = null;
    let data = null;
    let operationId = null;

    try {
      // throw error if it is an unknown route
      const isOperationAllowed = Object.keys(this.allOperations).includes(op);
      if (!isOperationAllowed) {
        throw new Error("Unknown Operation");
      }

      // throw error if a necessary input is missing (a and/or b)
      const hasNecessaryParameters = !isNaN(a) && !isNaN(b);
      if (!hasNecessaryParameters) {
        throw new Error("Input missing");
      }

      const getOperationResult = this.getOperation(op);
      const result = getOperationResult(a, b);

      const operationData = {
        operator_a: a,
        operator_b: b,
        operation: op,
        result,
      };

      // insert operation in the database
      data = await this.database.insertOperation("operations", operationData);

      // log query
      this.queryLog(data);
      operationId = data.id;

      // return result with status code and operation ID in the response header
      statusCode = 200;
      res.set("id", operationId).status(statusCode).send({ result });
    } catch (error) {
      if (error.message == "Unknown Operation") {
        statusCode = 404;
      } else if (error.message == "Input missing") {
        statusCode = 400;
      } else {
        statusCode = 500;
      }

      // return error code
      res.status(statusCode).send();
    }

    const end = +new Date();
    const executionTime = end - start;

    // log request
    this.requestLog({
      timestamp: new Date().toISOString(),
      executionTime,
      clientIp,
      statusCode,
      operationId,
    });
  };

  public validation = async (req, res) => {
    const start = +new Date();

    // inputs
    const operationId: number = req.query.id;
    const clientIp: string = req.ip.split(":").pop();

    let statusCode: number = null;
    let data = null;

    try {
      // validade parameter
      const hasNecessaryParameter = !!req.query.id;
      if (!hasNecessaryParameter) {
        throw new Error("Input missing");
      }

      // get opeartion from database
      data = await this.database.getOperationById("operations", operationId);

      const resultFound = !!data.result;
      if (!resultFound) {
        throw new Error("Result not found");
      }
      
      // log query
      this.queryLog(data);

      // return result with status code
      statusCode = 200;
      res.status(statusCode).send({ result: data.result });
    } catch (error) {
      if (error.message == "Input missing") {
        statusCode = 400;
      } else if (error.message == "Result not found" || error.name == "BSONTypeError") {
        statusCode = 404;
      } else {
        statusCode = 500;
      }
      
      // return error code
      res.status(statusCode).send();
    }
    const end = +new Date();
    const executionTime = end - start;

    this.requestLog({
      timestamp: new Date().toISOString(),
      executionTime,
      clientIp,
      statusCode,
      operationId,
    });
  };

  private getOperation = (operation) => {
    return this.allOperations[operation];
  };

  private queryLog = (data) => {
    if (this.logQueries) {
      queryLogger.log(data);
    }
  };

  private requestLog = (data) => {
    if (this.logRequests) {
      requestLogger.log(data);
    }
  };

  // read config file and set log variables
  private setLogConfig = async () => {
    const {
      logQueries: lq,
      logRequests: lr,
      logsTimeIntervalInMinutes: logTime,
    } = await config.getConfigFileData();
    this.logRequests = lr;
    this.logQueries = lq;
    queryLogger.setTimeIntervalInMinutes(logTime);
    requestLogger.setTimeIntervalInMinutes(logTime);
  };
}

module.exports = new OperationController(database);

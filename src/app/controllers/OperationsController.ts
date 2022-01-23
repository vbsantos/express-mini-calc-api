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
  private logRequests: boolean;
  private logQueries: boolean;
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
      // validade route
      const isOperationAllowed = Object.keys(this.allOperations).includes(op);
      if (!isOperationAllowed) {
        throw new Error("Unknown Operation");
      }

      // validade parameters
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

      data = await this.database.insertOperation("operations", operationData);
      this.queryLog(data);
      operationId = data.id;

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

  public validation = async (req, res) => {
    const start = +new Date();

    // inputs
    const operationId = req.query.id;
    const clientIp = req.ip.split(":").pop();

    let statusCode = null;
    let data = null;

    try {
      // validade parameter
      const hasNecessaryParameter = !!req.query.id;
      if (!hasNecessaryParameter) {
        throw new Error("Input missing");
      }

      data = await this.database.getOperationById("operations", operationId);
      this.queryLog(data);

      statusCode = 200;
      res.status(statusCode).send({ result: data.result });
    } catch (error) {
      if (error.message == "Input missing") {
        statusCode = 400;
      } else {
        statusCode = 500;
      }
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

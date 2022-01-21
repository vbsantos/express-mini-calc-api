// DATABASE
import { insertOperation, getOperationById } from "./database";

// LOGGER
import Logger from "./logger";
const logger = new Logger("logs/requests");

// CONFIG FILE
import { getConfigFileProperty, onConfigFileChange } from "./utils";

let logRequests;

const setLog = async () => {
  logRequests = await getConfigFileProperty("logRequests");
};
setLog();

onConfigFileChange(setLog);

const allOperations = {
  sum: (a, b) => a + b,
  sub: (a, b) => a - b,
  div: (a, b) => a / b,
  mul: (a, b) => a * b,
};

const getOperation = (op) => {
  return allOperations[op];
};

export const operation = async (req, res) => {
  try {
    const start = +new Date();

    const op = req.params.operation;
    const a = Number(req.query.a);
    const b = Number(req.query.b);

    const clientIp = req.ip.split(":").pop();

    // validade route
    const isOperationAllowed = Object.keys(allOperations).includes(op);
    if (!isOperationAllowed) {
      throw new Error("Unknown Operation");
    }
    
    // validade parameters
    const hasNecessaryParameters = !isNaN(a) && !isNaN(b);
    if (!hasNecessaryParameters) {
      throw new Error("Input missing");
    }

    const getOperationResult = getOperation(op);
    const result = getOperationResult(a, b);

    const operationData = {
      operator_a: a,
      operator_b: b,
      operation: op,
      result,
    };

    const operation = await insertOperation("operations", operationData);

    res.set("id", operation.insertedId).status(200).send({ result });

    const end = +new Date();
    const executionTime = end - start;

    if (logRequests) {
      logger.log({
        timestamp: new Date().toISOString(),
        executionTime: executionTime,
        clientIp: clientIp,
        statusCode: 200,
        operationId: operation.insertedId,
      });
    }
  } catch (error) {
    if (error.message == "Unknown Operation") {
      res.status(404).send();
    } else if (error.message == "Input missing") {
      res.status(400).send();
    } else {
      res.status(500).send();
    }
  }
};

export const validation = async (req, res) => {
  try {
    const start = +new Date();

    const operationId = req.query.id;
    const clientIp = req.ip.split(":").pop();

    // validade parameter
    const hasNecessaryParameter = !!req.query.id;
    if (!hasNecessaryParameter) {
      throw new Error("Input missing");
    }

    const { result } = await getOperationById("operations", operationId);

    res.status(200).send({ result });

    const end = +new Date();
    const executionTime = end - start;

    if (logRequests) {
      logger.log({
        timestamp: new Date().toISOString(),
        executionTime: executionTime,
        clientIp: clientIp,
        statusCode: 200,
        operationId: operationId,
      });
    }
  } catch (error) {
    if (error.message == "Input missing") {
      res.status(400).send();
    } else {
      res.status(500).send();
    }
  }
};

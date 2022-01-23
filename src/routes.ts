const routes = require("express").Router();
const operationController = require("./app/controllers/OperationsController");

import path from "path";

// ROUTES
routes.get("/", (_, res) =>
  res.sendFile(path.resolve("src", "docs", "index.html"))
);
routes.get("/api/v1/validation", operationController.validation);
routes.get("/api/v1/:operation", operationController.operation);

module.exports = routes;

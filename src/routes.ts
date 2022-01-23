import path from "path";

const routes = require("express").Router();
const operationController = require("./app/controllers/OperationsController");

// ROUTES

// api documentation
routes.get("/", (_, res) =>
  res.sendFile(path.resolve("src", "docs", "index.html"))
);

// result confirmation
routes.get("/api/v1/validation", operationController.validation);

// /sum, /sub, /div, /mult
routes.get("/api/v1/:operation", operationController.operation);

module.exports = routes;

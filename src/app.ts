const dotenv = require("dotenv");
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.testing" : ".env",
});

const express = require("express");
const app = express();
app.use(express.json());

// DATABASE 
import { connectToDatabase } from "./lib/database";

// SERVER ROUTES
import { operation, validation } from "./lib/operations";

// Connect to the database
connectToDatabase("minicalculadora");

// ENDPOINTS - /, /sum, /sub, /mul, /div, /validation
app.get("/", (_, res) => res.send("Mini Calculadora"));
app.get("/api/v1/validation", async (req, res) => await validation(req, res));
app.get("/api/v1/:operation", async (req, res) => await operation(req, res));

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${process.env.SERVER_PORT}`
  );
});

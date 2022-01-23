const path = require("path");
const express = require("express");

class App {
  public express;

  constructor() {
    this.express = express();

    this.middlewares();
    this.routes();
  }

  private middlewares() {
    this.express.use(express.json());

    // for the documentation static files
    this.express.use(express.static(path.resolve("src","docs")));
  }

  private routes() {
    this.express.use(require("./routes"));
  }
}

module.exports = new App().express;

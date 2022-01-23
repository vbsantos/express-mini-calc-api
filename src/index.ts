const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = require("./app");
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, () => {
  console.log(`⚡️ [server]: Server listening on PORT ${PORT}`);
  console.log(`📚 [server]: Check the API documentation at http://${HOST}:${PORT}/`);
});

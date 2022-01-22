const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = require("./app");

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${process.env.PORT}`
  );
});
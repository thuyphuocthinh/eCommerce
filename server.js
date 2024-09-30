const app = require("./src/app");
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App connecting successfully on port ${port}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Exit Server Express");
  });
});

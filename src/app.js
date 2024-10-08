// create an express instance
const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const routes = require("./routes/index.route");
const bodyParser = require("body-parser");
require("dotenv").config();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// init db
require("./dbs/init.mongodb");
const { countConnect } = require("./helpers/check.connect");
countConnect();

// init routes
app.use(routes);

// handling errors
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;

// create an express instance
const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init db
require("./dbs/init.mongodb");
const { countConnect } = require("./helpers/check.connect");
countConnect();

// init routes

// handling errors

module.exports = app;

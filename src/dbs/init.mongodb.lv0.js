"use strict";

const mongoose = require("mongoose");
const connectString = `mongodb://localhost:27017/shopDEV`;

mongoose
  .connect(connectString)
  .then(() => console.log("Connect db successfully"))
  .catch((err) => console.log("Error db connect"));

// dev
if (1 === 1) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;

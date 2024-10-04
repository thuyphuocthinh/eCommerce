"use strict";

const mongoose = require("mongoose");
const connectString = `mongodb+srv://thuyphuocthinh:09122003@cluster.ltftnvr.mongodb.net/shopDEV`;
const { countConnect } = require("../helpers/check.connect");
class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString)
      .then(() => console.log("Connect db successfully", countConnect()))
      .catch((err) => console.log("Error db connect"));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;

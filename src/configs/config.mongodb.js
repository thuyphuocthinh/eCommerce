"use strict";

// level 0
// const config = {
//   app: {
//     port: 3000,
//   },
//   db: {
//     host: "localhost",
//     port: 27017,
//     name: "db",
//   },
// };

// level 1

const dev = {
  app: {
    port: process.env.DEV_PORT || 3052,
  },
  db: {
    host: process.env.DEV_DB_HOST || "localhost",
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || "shopDEV",
  },
};

const production = {
  app: {
    port: process.env.PRODUCTION_PORT || 3000,
  },
  db: {
    host: process.env.PRODUCTION_DB_HOST || "localhost",
    port: process.env.PRODUCTION_DB_PORT || 27017,
    name: process.env.PRODUCTION_DB_NAME || "shopPRO",
  },
};
const config = { dev, production };
const NODE_ENV = process.env.NODE_ENV || "dev";
// level 2

module.exports = config[NODE_ENV];

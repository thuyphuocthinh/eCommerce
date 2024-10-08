"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
const router = express.Router();

// check apiKey
router.use(apiKey);
router.use(permission("0000"));
// check permissions

router.use("/v1/api", require("./access/index.route"));
router.use("/v1/api/product", require("./product/index.route"));

module.exports = router;

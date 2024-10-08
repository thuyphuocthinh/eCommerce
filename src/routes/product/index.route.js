"use strict";

const express = require("express");
const router = express.Router();
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");

// authentication
router.use(authentication);
////////////////

router.post("/create", asyncHandler(productController.createProduct));

module.exports = router;

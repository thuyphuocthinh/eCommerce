"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const cartController = require("../../controllers/cart.controller");

// authentication
router.use(authenticationV2);
////////////////

router.post("/add", asyncHandler(cartController.addToCart));
router.delete("/delete", asyncHandler(cartController.delete));
router.post("/update", asyncHandler(cartController.update));
router.get("/getList", asyncHandler(cartController.getList));

module.exports = router;

"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const inventoryController = require("../../controllers/inventory.controller");

// authentication
router.use(authenticationV2);
////////////////

router.post("/addStock", asyncHandler(inventoryController.checkoutReview));

module.exports = router;

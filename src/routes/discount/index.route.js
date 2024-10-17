"use strict";

const express = require("express");
const router = express.Router();
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const discountController = require("../../controllers/discount.controller");

router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get(
  "/list_product_code",
  asyncHandler(discountController.getAllDiscountCodesWithProducts)
);

// authentication
router.use(authentication);
////////////////

router.post("/create", asyncHandler(discountController.createDiscountCode));
router.get("/list_code", asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;

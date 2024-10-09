"use strict";

const express = require("express");
const router = express.Router();
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");

router.get("/search/:keySearch", asyncHandler(productController.getListSearchProduct));

// authentication
router.use(authentication);
////////////////

router.post("/create", asyncHandler(productController.createProduct));
router.post("/publish/:id", asyncHandler(productController.publishProduct));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProduct));

// QUERY
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;

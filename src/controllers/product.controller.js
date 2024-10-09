"use strict";

const { SuccessResponse } = require("../core/success.response");
// const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.v2");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Created new product successfully",
      metadata: await ProductServiceV2.ProductFactory.createProduct(
        req.body.product_type,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };

  publishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Created new product successfully",
      metadata: await ProductServiceV2.ProductFactory.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  unpublishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Created new product successfully",
      metadata: await ProductServiceV2.ProductFactory.unpublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // QUERY
  /**
   * @description Get all drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @param {String} product_shop
   * @return {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list draft success",
      metadata: await ProductServiceV2.ProductFactory.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list publish success",
      metadata: await ProductServiceV2.ProductFactory.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search success",
      metadata: await ProductServiceV2.ProductFactory.searchProducts({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };
  // END QUERY
}

module.exports = new ProductController();

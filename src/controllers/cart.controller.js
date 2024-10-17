"use strict";

const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.updateCart(req.body),
    }).send(res);
  };

  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  };

  getList = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.getListUserCart(req.query),
    }).send(res);
  };
}

module.exports = new CartController();

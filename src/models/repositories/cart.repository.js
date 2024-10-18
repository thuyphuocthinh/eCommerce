"use strict";

const { convertToObjectIdMongoose } = require("../../utils");
const cartModel = require("../cart.model");

const findCartById = async (cartId) => {
  return await cartModel
    .findOne({ _id: convertToObjectIdMongoose(cartId), cart_state: "active" })
    .lean();
};

module.exports = {
  findCartById,
};

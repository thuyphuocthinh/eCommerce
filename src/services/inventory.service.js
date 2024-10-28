"use strict";

const { BadRequestError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repository");

// service for nhap hang vao kho
class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "123, Bach Dang, Danang City",
  }) {
    const product = await getProductById(productId);
    if (!product) {
      throw new BadRequestError("The product does not exist");
    }
    const query = { inven_shopId: shopId, inven_productId: productId };
    const updateSet = {
      $inc: {
        inven_stock: stock,
      },
      $set: {
        inven_location: location,
      },
    };
    const options = { upsert: true, new: true };
    return await inventoryModel.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = InventoryService;

"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

const inventorySchema = new Schema(
  {
    inven_productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    inven_location: {
      type: String,
      default: "Unknown",
    },
    inven_stock: {
      type: Number,
      required: true,
    },
    inven_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    inven_reservations: {
      type: Array,
      default: [],
    },
    /*
        {
            cartId
            stock
            createdOn
        }
    */
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, inventorySchema);

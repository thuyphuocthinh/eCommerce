const inventoryModel = require("../inventory.model");
const { Types } = require("mongoose");

const insertInventory = async ({
  product_id,
  shop_id,
  stock,
  location = "unknown",
}) => {
  return await inventoryModel.create({
    inven_productId: product_id,
    inven_shopId: shop_id,
    inven_location: location,
    inven_stock: stock,
  });
};

module.exports = {
  insertInventory,
};

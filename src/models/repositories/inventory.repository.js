const { convertToObjectIdMongoose } = require("../../utils");
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

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inven_productId: convertToObjectIdMongoose(productId),
    inven_stock: { $gte: quantity },
  };
  const updateSet = {
    $inc: {
      inven_stock: -quantity,
    },
    $push: {
      inven_reservations: {
        quantity,
        cartId,
        createdOn: new Date(),
      },
    },
  };
  const options = { upsert: true, new: true };
  return await inventoryModel.findOneAndUpdate(query, updateSet);
};

module.exports = {
  insertInventory,
  reservationInventory,
};

"use strict";

const { unGetSelectData } = require("../../utils");
const discountModel = require("../discount.model");

const findAllDiscountCodesUnselect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  unSelect,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean();
  return documents;
};

const findAllDiscountCodesSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  select,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelection(select))
    .lean();
  return documents;
};

const checkDiscountExist = async ({ code, shopId }) => {
  return await discountModel
    .findOne({
      discount_code: code,
      discount_shop_id: convertToObjectIdMongoose(shopId),
    })
    .lean();
};

module.exports = {
  findAllDiscountCodesUnselect,
  findAllDiscountCodesSelect,
  checkDiscountExist,
};

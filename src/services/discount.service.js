"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodesUnselect,
  checkDiscountExist,
} = require("../models/repositories/discount.repository");
const {
  findAllProducts,
} = require("../models/repositories/product.repository");
const { convertToObjectIdMongoose } = require("../utils");

/**
 * Discount Services
 * 1 - Generator Discount Code [Shop | Admin]
 * 2 - Get discount amount [User]
 * 3 - Get all discount codes [User | Shop]
 * 4 - Verify discount code [User]
 * 5 - Delete discount [Shop | Admin]
 * 6 - Cancel discount [User]
 */

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      value,
    } = payload;
    // check
    if (new Date() < new Date(start_date) || new Date() > new date(end_date)) {
      throw new BadRequestError("Discount code has expired");
    }
    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date");
    }
    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectIdMongoose(shopId),
      })
      .lean();
    if (foundDiscount) {
      throw new BadRequestError("Discount code already exists");
    }
    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_max_value: max_value,
      discountModel: min_order_value || 0,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_shop_id: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode() {
    // ...
  }

  // Get list products by discount_code for user
  static async getAllDiscountCodesWithProducts({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectIdMongoose(shopId),
      })
      .lean();
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exists!");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let products;
    if (discount_applies_to === "all") {
      // get all products
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongoose(shopId),
          isPublished: true,
        },
        limit: limit,
        page: page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      // get the products from product_ids
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: limit,
        page: page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  // Get all discount code for shop
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnselect({
      limit: limit,
      page: page,
      filter: {
        discount_shop_id: convertToObjectIdMongoose(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shop_id"],
      model: discountModel,
    });
    return discounts;
  }

  // Apply disount code of shop not global
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExist({
      code: codeId,
      shopId: shopId,
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount not exist!");
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new NotFoundError("Discount expired!");
    }

    if (!discount_max_uses) throw new NotFoundError("Discounts are used up");

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("Discount expired!");
    }

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce(
        (acc, product) => acc + product.quantiy * product.price,
        0
      );
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount requires a minimum order value of ${discount_min_order_value}`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userDiscount) {
        //
      }
    }

    // check xem discount nay la fix amount hay dynamic
    const amount =!
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  // Delete discount
  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shop_id: convertToObjectIdMongoose(shopId),
    });
    return deleted;
  }

  // Cancel discount
  static async cancelDiscountCode({ shopId, codeId, userId }) {
    const foundDiscount = await checkDiscountExist({
      code: codeId,
      shopId: shopId,
    });
    if (!foundDiscount) {
      throw new NotFoundError("Discount not exists!");
    }
    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: { discount_users_used: userId },
      $inc: {
        discount_max_uses: +1,
        discount_uses_count: -1,
      },
    });
    return result;
  }
}

module.exports = DiscountService;

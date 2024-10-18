"use strict";

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repository");
const {
  checkProductByServer,
} = require("../models/repositories/product.repository");
const { getDiscountAmount } = require("./discount.service");

class CheckoutService {
  /*
        {
            cartId,
            userId,
            shop_oder_ids: [
                {
                    shopId,
                    shopDiscount: [
                        {
                            shopId,
                            discountId,
                            codeId
                        }
                    ],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                },
                {
                    shopId,
                    shopDiscount: [],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // check cartId exists?
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError("Cart does not exist");

    // general info of order
    const checkout_order = {
      totalPrice: 0, //tong tien hang
      feeShip: 0, // phi van chuyen
      totalDiscount: 0, // tong tien discount giam gia
      totalCheckout: 0, // tong phai tra
    };
    const shop_order_ids_new = [];

    // loop through each shop
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discount = [],
        item_products = [],
      } = shop_order_ids[i];
      const checkProductServer = await checkProductByServer(item_products);
      if (!checkProductServer[0]) throw new BadRequestError("Order wrong");
      const checkoutPrice = checkProductServer.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      );
      checkout_order.totalCheckout += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      if (shop_discounts.length > 0) {
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });
        checkout_order.totalDiscount += discount;
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  // order
  /**
   * 1. Kiểm tra đơn hàng
   * 2. Kiểm tra kho hàng
   */
  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });
    // check lai mot lan nua xem vuot ton kho hay khong
    // get new array products
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      
    }
  }
}

module.exports = CheckoutService;

/**
 * 1. Kiểm tra giỏ hàng có tồn tại không
 * 2. Kiểm tra shopId, userId có tồn tại không (cho chắc)
 * 3. Tạo một obj checkout_order mang thông tin giá tổng, giá discount, giá phải trả => trả cho client
 * 4. Duyệt qua danh sách sản phẩm từng shop, check thông tin sản phẩm lại, rồi check shop có disount không
 * 5. Trả ra {
 *     shop_order_ids,
 *     shop_order_ids_new,
 *     checkout_ordre,
 *    }
 */

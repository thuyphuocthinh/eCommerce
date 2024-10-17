"use strict";

const { NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repository");

/*
    - add product to cart
    - reduce product quantity by one
    - increase product quantity by one
    - get cart
    - delete all
    - delete item
*/

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
    };
    const options = { upsert: true, new: true };
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
      cart_userId: userId,
      "cart_products.productId": productId,
      cart_state: "active",
    };
    const updateSet = {
      $inc: {
        "cart_products.$.quantity": quantity,
      },
    };
    const options = { upsert: true, new: true };
    return await cartModel.findOneAndUpdate(query, updateSet, options);
  }

  static async addToCart({ userId, product = {} }) {
    // check cart
    const userCart = await cartModel.findOne({ cart_userId: userId }).lean();
    if (!userCart) {
      // create a new cart
      return await CartService.createUserCart({ userId, product });
    }
    // if cart exists, but cart is empty
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }
    // else if cart is not empty and the product exists => update quantity
    return await CartService.updateUserCartQuantity({ userId, product });
  }

  /*
    shop_order_ids: [
        {
            shopId,
            item_products: [
                {
                    quantity,
                    price,
                    shopId,
                    old_quantity,
                    productId
                }
            ],
            version:
        }
    ]
  */
  static async updateCart({ userId, product = {} }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    // check product
    const foundProduct = await getProductById(productId);
    if (!foundProduct) {
      throw new NotFoundError("Not found product");
    }
    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError("Not found product");
    }
    if (quantity === 0) {
      // delete item
    }
    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId: productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" };
    const updateSet = {
      $pull: {
        cart_products: { productId },
      },
    };
    const deleteCart = await cartModel.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel.findOne({ cart_userId: +userId }).lean();
  }
}

module.exports = CartService;

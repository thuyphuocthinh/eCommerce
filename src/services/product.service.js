"use strict";

const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");

// define factory pattern class to create product
class ProductFactory {
  /**
   * type: "Clothing", "Electronic"
   */
  static async createProduct(type, payload) {
    switch (type) {
      case "Electronics":
        return new Electronics(payload).createProduct();

      case "Clothing":
        return new Clothing(payload).createProduct();

      case "Furniture":
        return new Furniture(payload).createProduct();

      default:
        throw new BadRequestError("Invalid Product Type");
    }
  }
}

// define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}

// define class for clothing
class Clothing extends Product {
  async createProduct() {
    const newCLothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newCLothing) {
      throw new BadRequestError("Create new clothing error");
    }
    const newProduct = await super.createProduct(newCLothing._id);
    if (!newProduct) {
      throw new BadRequestError("Create new product error");
    }
    return newProduct;
  }
}

// define class for electronic
class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) {
      throw new BadRequestError("Create new electronic error");
    }
    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new BadRequestError("Create new product error");
    }
    return newProduct;
  }
}

// define class for furniture
class Furniture extends Product {
  async createProduct() {
    const newElectronic = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) {
      throw new BadRequestError("Create new furniture error");
    }
    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new BadRequestError("Create new product error");
    }
    return newProduct;
  }
}

module.exports = ProductFactory;

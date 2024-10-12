"use strict";

const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const {
  insertInventory,
} = require("../models/repositories/inventory.repository");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unpublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repository");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");

// define factory pattern class to create product
class ProductFactory {
  /**
   * type: "Clothing", "Electronic"
   */
  static productRegistry = {}; // key - class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid product type ${type}`);
    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, product_id, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid product type ${type}`);
    return new productClass(payload).updateProduct(product_id);
  }

  // PUBLISH
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }
  // UNPUBLISH
  static async unpublishProductByShop({ product_shop, product_id }) {
    return await unpublishProductByShop({ product_shop, product_id });
  }

  // QUERY FOR DRAFTS
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  // QUERY FOR PUBLISHED
  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }
  // SEARCH
  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_thumb", "product_price"],
    });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ["__v"] });
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
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      await insertInventory({
        product_id: newProduct._id,
        shop_id: this.product_shop,
        stock: newProduct.product_quantity,
      });
    }
    return newProduct;
  }

  async updateProduct(product_id, bodyUpdate) {
    return await updateProductById({ product_id, bodyUpdate, model: product });
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

  async updateProduct(product_id) {
    const objectParams = removeUndefinedObject(this);
    if (objectParams.product_attributes) {
      await updateProductById({
        product_id,
        bodyUpdate: updateNestedObjectParser(objectParams),
        model: clothing,
      });
    }
    const updateProduct = await super.updateProduct(
      product_id,
      updateNestedObjectParser(objectParams)
    );
    return updateProduct;
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
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) {
      throw new BadRequestError("Create new furniture error");
    }
    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestError("Create new product error");
    }
    return newProduct;
  }
}

ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = {
  ProductFactory,
  Clothing,
  Electronics,
  Furniture,
};

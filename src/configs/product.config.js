const {
  Electronics,
  Clothing,
  Furniture,
} = require("../services/product.service.v2");

const productConfig = {
  Electronics: Electronics,
  Clothing: Clothing,
  Furniture: Furniture,
};

module.exports = productConfig;

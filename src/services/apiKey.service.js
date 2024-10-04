const apiKeyModel = require("../models/apiKey.model");
const findById = async (key) => {
  const objKey = await apiKeyModel.findOne({ key: key, status: true }).lean();
  return objKey;
};

module.exports = {
  findById,
};

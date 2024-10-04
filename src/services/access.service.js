"user strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /**
   * 1 - check email
   * 2 - match password
   * 3 - create AT and RT and save
   * 4 - generate tokens
   * 5 - get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registerred");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(passwordHash, foundShop.password);
    console.log("match: ", match);

    if (!match) {
      throw new AuthFailureError("Authentication Error");
    }

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId: foundShop._id,
    });

    return {
      metadata: {
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: foundShop,
        }),
        tokens,
      },
    };
  };

  static signUp = async ({ name, email, password }) => {
    // step1: check email exists
    const emailExist = await shopModel.findOne({ email }).lean();
    if (emailExist) {
      throw new BadRequestError("Error: Shop already registerred!");
    }

    // step2: insert new account
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      /**
         * ---- advanced ----
          const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            privateKeyEncoding: {
              type: "pkcs1",
              format: "pem",
            },
            publicKeyEncoding: {
              type: "pkcs1",
              format: "pem",
            },
          });
         */

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Public key string error!");
      }

      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      return {
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      metadata: null,
    };
  };

  static logout = async (keyStore) => {
    return (delKey = await KeyTokenService.removeKeyById(keyStore._id));
  };
}

module.exports = AccessService;

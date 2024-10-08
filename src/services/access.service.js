"user strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
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
    const match = await bcrypt.compare(password, foundShop.password);
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

  /**
   *
   *
   */

  // handle refresh token v1
  static handleRefreshToken = async (refreshToken) => {
    // check xem token da duoc su dung chua
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    // neu co
    if (foundToken) {
      // decode xem may la thang nao ma su dung refresh token da bi xoa
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      // xoa tat ca token trong store cua userId
      await KeyTokenService.deleteKeyById(userId);

      // throw new Error
      throw new ForbiddenError("Something wrong happend! Please relogin!");
    }
    // neu chua co, check refresh token nay dang duoc su dung phai khong, chua het han
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureError("Shop not registerred");
    }
    // verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    // check user using shop service
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registerred");
    }

    // create 1 cap token moi
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token in keyTokenModel of valid and authorized user
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // refresh input de lay cap token moi duoc danh dau la da dung xong
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  // handle refresh token v2
  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happend! Please relogin!");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registerred");
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registerred");
    }

    // create 1 cap token moi
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    // update token in keyTokenModel of valid and authorized user
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // refresh input de lay cap token moi duoc danh dau la da dung xong
      },
    });

    return {
      user,
      tokens,
    };
  };
}

module.exports = AccessService;

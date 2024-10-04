"use strict";
const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    // refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });
    // verify
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error("error verify::", err);
      } else {
        console.log("decode verify::", decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1. Check userId missing???
   * 2. Get access token
   * 3. Verity token
   * 4. Check user in db
   * 5. check keyStore with this userId
   * 6. ok all => return next
   */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError("Invalid request");
  }
  const keyStore = await findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError("Not Found KeyStore");
  }
  const accessToken = req.header[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw AuthFailureError("Invalid request");
  }
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.privateKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid user");
    }
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createTokenPair,
  authentication
};

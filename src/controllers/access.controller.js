"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Registerred successfully",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
    // return res.status(201).json(await AccessService.signUp(req.body));
  };
  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };
  handleRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Get token success",
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    // }).send(res);
    // V2
    new SuccessResponse({
      message: "Get token success",
      metadata: await AccessService.handleRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };
}

module.exports = new AccessController();

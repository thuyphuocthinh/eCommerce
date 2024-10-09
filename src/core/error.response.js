"use strict";

const reasonPhrases = require("../utils/reasonPhrases");
const statusCodes = require("../utils/statusCodes");

const StatusCode = {
  FORBIDDEN: 403,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
};

const ReasonStatusCode = {
  FORBIDDEN: "Bad request error",
  CONFLICT: "Conflict error",
  UNAUTHORIZED: "Unauthorized",
};

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message = reasonPhrases.CONFLICT,
    statusCode = statusCodes.CONFLICT
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = reasonPhrases.BAD_REQUEST,
    statusCode = statusCodes.BAD_REQUEST
  ) {
    super(message, statusCode);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(
    message = reasonPhrases.UNAUTHORIZED,
    statusCode = statusCodes.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = reasonPhrases.UNAUTHORIZED,
    statusCode = statusCodes.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(
    message = reasonPhrases.FORBIDDEN,
    statusCode = statusCodes.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
};

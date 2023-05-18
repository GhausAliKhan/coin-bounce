const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../config/index");
const { REFRESH_TOKEN_SECRET } = require("../config/index");
const RefreshToken = require("../models/token");
class JWTservice {
  // 1 - Sign Access Tokens
  static signAccessToken(payload, expiryTime) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
  }

  // 2 - Sign Refresh Tokens
  static signRefreshToken(payload, expiryTime) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime });
  }
  // 3 - Verify Access Tokens
  static verifyAccesToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  }

  // 4 - Verify Refresh Tokens
  static verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  }

  // 5 - Store Refresh Tokens
  static async storeRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({
        token: token,
        userId: userId,
      });
      await newToken.save();
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = JWTservice;

// services/token.service.js
const jwt = require('jsonwebtoken');
import { User } from "../models/User.js"
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRY_DAYS = process.env.REFRESH_TOKEN_EXPIRY_DAYS || 30;

class TokenService {
  static generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static async generateRefreshToken(user) {
    const refreshToken = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` }
    );

    const expires = new Date();
    expires.setDate(expires.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await User.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: { token: refreshToken, expires }
      }
    });

    return refreshToken;
  }

  static async verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  static async revokeToken(token) {
    const decoded = jwt.decode(token);
    return User.updateOne(
      { _id: decoded.id, 'refreshTokens.token': token },
      { $pull: { refreshTokens: { token } } }
    );
  }
}

module.exports = TokenService;
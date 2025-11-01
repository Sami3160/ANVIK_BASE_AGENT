// services/auth.service.js
const User = require('../models/User');

class AuthService {
  static async findOrCreateUser(profile, tokens) {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
        photo: profile.photos?.[0]?.value,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      });
    } else {
      user.accessToken = tokens.access_token;
      user.refreshToken = tokens.refresh_token;
      user.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    }

    await user.save();
    return user;
  }
}

module.exports = AuthService;
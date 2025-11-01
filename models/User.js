// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  photo: String,
  accessToken: String,
  refreshToken: String,
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'users'); // 'users' is the collection name
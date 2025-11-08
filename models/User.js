// models/User.js
// const mongoose = require('mongoose');
import {mongoose} from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  photo: String,
  accessToken: String,
  refreshToken: String,
  expiresAt: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'users'); // 'users' is the collection name


export {User};
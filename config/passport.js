// const passport = require('passport');
import passport from 'passport';
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';
import {AuthService} from  '../services/auth.service.js';

export default function passportCallback(passport) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await AuthService.findOrCreateUser(profile, { 
          access_token: accessToken, 
          refresh_token: refreshToken,
          expires_in: 3600
        });
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error, null);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      // console.log(user);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import passportCallback from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { User } from './models/User.js';
import PassportGoogle from 'passport-google-oauth20';
const GoogleStrategy = PassportGoogle.Strategy;

// Now you can use GoogleStrategy as you intended:
// passport.use(new GoogleStrategy(...));import { User } from './models/User.js';
import {AuthService} from  './services/auth.service.js';
dotenv.config();

// Initialize app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/anvik', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});
const corsOptions = {
  origin: 'http://localhost:5173', // Your React app's URL
  credentials: true, // This allows session cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'car',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// passportCallback(passport);
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



app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/ai', aiRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
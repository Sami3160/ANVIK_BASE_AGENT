const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
require('dotenv').config();

const app = express();

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle MongoDB duplicate key error
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(400).json({ 
      error: 'User with this email already exists' 
    });
  }

  // Handle other errors
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Serialize & deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google strategy
// Update your Google Strategy configuration
// Update your Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists by googleId
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // If user doesn't exist, create a new one
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null
      });
    }

    return done(null, user);
  } catch (error) {
    console.error('Error in Google Strategy:', error);
    return done(error, null);
  }
}));
// Update your routes
app.get('/auth/google/url', (req, res) => {
  const telegramId = req.query.telegramId; // Get telegramId from query params
  const url = `http://localhost:5000/auth/google?state=${encodeURIComponent(telegramId)}`;
  res.json({ url });
});


app.get('/auth/google', 
  (req, res, next) => {
    // Configure the scope and other options
    const options = {
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      accessType: 'offline',
      prompt: 'consent',
      state: req.query.state // Pass through the telegramId
    };
    passport.authenticate('google', options)(req, res, next);
  }
);
app.get('/auth/google/callback', 
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: '/auth/failed',
      session: false
    })(req, res, (err) => {
      if (err) {
        console.error('Authentication error:', err);
        return res.redirect('/auth/failed?error=' + encodeURIComponent(err.message));
      }
      next();
    });
  },
  (req, res) => {
    // Successful authentication
    const successHTML = `
      <!-- Your success HTML here -->
      Success
    `;
    res.send(successHTML);
  }
);

// Add error route
app.get('/auth/failed', (req, res) => {
  const errorHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Failed</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #F0F4F7;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .container {
          background-color: #FFFFFF;
          padding: 2.5rem 3rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          max-width: 400px;
          width: 90%;
        }
        h1 {
          color: #D9534F;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        p {
          font-size: 1.1rem;
          color: #333;
          line-height: 1.5;
          margin-bottom: 2rem;
        }
        .button {
          display: inline-block;
          background-color: #0088CC;
          color: #FFFFFF;
          padding: 1rem 1.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          transition: background-color 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .button:hover {
          background-color: #0077B3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Login Failed</h1>
        <p>❌ An error occurred while connecting your Google account. Please try again.</p>
        <a href="https://t.me/AnvikAssistant_Bot" class="button">
          Return to @AnvikAssistant_Bot
        </a>
      </div>
    </body>
    </html>
  `;
  res.status(500).send(errorHTML);
});

// Routes
app.get('/', (req, res) => res.send('Home page'));



app.get('/logout', (req, res) => {
  req.logout(() => res.send('Logged out'));
});

// Protected route example
app.get('/profile', (req, res) => {
  if (!req.user) return res.status(401).send('Not authorized');
  res.json(req.user);
});

// Start server
app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`)
);

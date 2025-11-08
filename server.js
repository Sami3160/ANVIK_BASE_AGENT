const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const cors=require('cors');
require('dotenv').config();

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
require('./config/passport')(passport);

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/user', require('./routes/user.routes'));
app.use('/ai', require('./routes/ai.routes'));

// Home route
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
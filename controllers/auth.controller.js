const AuthService = require('../services/auth.service');

exports.googleAuth = (req, res, next) => {
  // This will be handled by passport
};

exports.googleCallback = (req, res) => {
  // res.send(`
  //   <!DOCTYPE html>
  //   <html>
  //   <head>
  //     <title>Success</title>
  //   </head>
  //   <body>
  //     <h1>Login Successful!</h1>
  //     <p>Welcome, ${req.user.displayName}!</p>
  //     <a href="/profile">View Profile</a>
  //     <a href="/logout">Logout</a>
  //   </body>
  //   </html>
  // `);
  res.redirect('http://localhost:5173/profile');

  // res.json({ message: 'Login successful', user: req.user });
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:5173/');
  });
};
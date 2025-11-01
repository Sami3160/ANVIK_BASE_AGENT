exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // res.redirect('/auth/google');
  res.status(401).json({ message: 'Unauthorized' });
};
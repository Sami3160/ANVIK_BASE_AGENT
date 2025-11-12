export const isAuthenticated = (req, res, next) => {
  // Check if the user is authenticated
  const isAuthenticated = req.isAuthenticated();
  console.log('isAuthenticated: ', isAuthenticated); // Add this line for debugging

  if (isAuthenticated) {
    return next();
  }
  // res.redirect('/auth/google');
  res.status(401).json({ message: 'Unauthorized' });
};
exports.getProfile = (req, res) => {
  res.send(`
    <h1>Welcome ${req.user.displayName}!</h1>
    <img src="${req.user.photo}" alt="Profile" width="100">
    <p>Email: ${req.user.email}</p>
    <a href="/logout">Logout</a>
  `);
};

exports.ask = (req, res) => {
  res.json({ message: 'hello' });
};
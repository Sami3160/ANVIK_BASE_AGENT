const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const userData=await User.findById(req.user.id);
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.ask = (req, res) => {
  res.json({ message: 'hello' });
};
import {User} from "../models/User.js";

const getProfile = async (req, res) => {
  try {
    // console.log("req.user "+req.user);
    const userData=await User.findById(req.user._id);
    // console.log("req.user.id "+req.user.id);
    // console.log("userData "+userData);
    res.status(200).json(userData);
  } catch (error) {
    console.log("error in getProfile "+error);
    res.status(500).json({ error: error.message });
  }
};

const ask = (req, res) => {
  const userQuery=req.body.query;
  res.json({ message: 'hello' });
};

export {getProfile, ask};
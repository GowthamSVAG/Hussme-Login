const jwt = require("jsonwebtoken");
const User=require('../model')

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Missing Token" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, async (err, decode) => {
    if (err) {
      return res.status(408).json({ message: "invalid Token" });
    }
    const user = await User.findOne({ _id: decode.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  });
};
module.exports = verifyToken;

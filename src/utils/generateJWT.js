const jwt = require("jsonwebtoken");
const config = require("../config/config");

exports.generateJWT = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: "7d",
  });
};
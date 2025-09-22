// src/middlewares/reviewAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // 
// Check if user is authenticated
const authReview = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) throw new Error("User not found");

      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// only allow owners or admins
const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "owner" && req.user.role !== "admin")) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

module.exports = { authReview, isOwnerOrAdmin };

const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    throw new Error("Access denied: No authorization header is present");
  }

  const token = authHeader.replace("Bearer ", "");
  console.log(token);
  if (!token) {
    throw new Error("Access denied: No token provided");
  }

  try {
    const { userId } = jwt.verify(token, `${process.env.JWT_SECRET}`);

    const user = await User.findByPk(userId);

    if (user) {
      req.user = user;
      next();
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Invalid or expired token");
  }
};

module.exports = checkAuth;

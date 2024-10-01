const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    const error = new Error(
      "Access denied: No authorization header is present"
    );
    error.status = 401;
    return next(error);
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    const error = new Error("Access denied: No token provided");
    error.status = 401;
    return next(error);
  }

  try {
    const { userId } = jwt.verify(token, `${process.env.JWT_SECRET}`);

    const user = await User.findByPk(userId);

    if (user) {
      req.user = user;
      next();
    } else {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
  } catch (error) {
    console.log(error);
    const customError = new Error("Invalid or expired token");
    customError.status = 401;
    return next(customError);
  }
};

module.exports = checkAuth;

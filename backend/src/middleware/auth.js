const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;

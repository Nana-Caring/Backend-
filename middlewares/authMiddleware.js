const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from Authorization header (in the format "Bearer <token>")
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Check if token is missing
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Authorization failed: ", err); // Log the error for better debugging
    return res.status(401).json({ message: "Authorization failed" });
  }
};

module.exports = authMiddleware;

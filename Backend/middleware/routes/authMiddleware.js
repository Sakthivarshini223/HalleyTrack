const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract from "Bearer TOKEN"

  if (!token) return res.status(403).json({ message: "Access Denied: No Token" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};


const authorize = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Unauthorized: Admins only" });
    }
    next();
  };
};

module.exports = { protect, authorize };
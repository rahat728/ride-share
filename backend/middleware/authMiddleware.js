const jwt = require('jsonwebtoken');
const tokenBlacklist = new Set();

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token has been invalidated.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const logout = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) tokenBlacklist.add(token); // Add token to blacklist
  res.json({ message: 'Logged out successfully' });
};

module.exports = { protect };

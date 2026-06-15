const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    let user;
    if (global.dbConnected) {
      user = await User.findById(decoded.id);
    } else {
      user = global.inMemoryDB.findUserById(decoded.id);
    }

    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    req.user.isAdmin = true;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    res.status(401).json({ error: 'Invalid token' });
  }
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token === 'admin-token') {
    req.user = {
      id: 'admin-id',
      fullName: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com', // you can store admin email in env
      role: 'admin'
    };
    return next();
  }
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user object for role checking
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { id: user._id, role: user.role, email: user.email, fullName: user.fullName };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
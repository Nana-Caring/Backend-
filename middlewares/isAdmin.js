module.exports = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'highcourt')) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};
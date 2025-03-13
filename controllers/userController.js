// controllers/userController.js

// Dummy data for illustration (replace with real logic)
const getUser = (req, res) => {
    // For now, we're assuming the user is available via the JWT token in `req.user`
    res.json({ message: "This is the user info", user: req.user });
  };
  
  module.exports = {
    getUser
  };
  
// controllers/userController.js
exports.getUser = async (req, res) => {
    try {
      // Assuming the user's ID is stored in `req.user.id` by the `authMiddleware`
      const userId = req.user.id;
  
      // Fetch user from the database (adjust based on your model and ORM)
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Return the user data without sensitive fields like password
      const userData = user.get({ plain: true });
      delete userData.password;
  
      res.json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  //retrieve all the users
  exports.getUsers = async (req, res) => {
    try {
        // Fetch all users, excluding passwords
        const users = await User.findAll({
            attributes: { exclude: ["password"] }
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
  
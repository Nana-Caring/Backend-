const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); // Adjust this path as needed

const {
  register,
  login,
  getUser,
  registerDependent,
  getDependents
} = require('../controllers/userController');

// Define routes based on available controller functions
if (typeof register === 'function') {
  router.post('/register', register);
}

if (typeof login === 'function') {
  router.post('/login', login);
}

if (typeof getUser === 'function') {
  router.get('/me', auth, getUser);
}

if (typeof registerDependent === 'function') {
  router.post('/dependents', auth, registerDependent);
}

if (typeof getDependents === 'function') {
  router.get('/dependents', auth, getDependents);
}

module.exports = router;

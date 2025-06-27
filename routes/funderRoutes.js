const express = require('express');
const router = express.Router();
const funderController = require('../controllers/funderController');
const authMiddleware = require('../middlewares/auth');

router.post('/link-dependent', authMiddleware, funderController.linkDependent);

module.exports = router;
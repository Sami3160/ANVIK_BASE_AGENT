const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

router.get('/profile', isAuthenticated, userController.getProfile);
router.get('/ask', isAuthenticated, userController.ask);

module.exports = router;
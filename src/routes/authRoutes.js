const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signin/new_token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/info', authenticate, authController.info)

module.exports = router;

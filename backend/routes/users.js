const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.post('/forgot', forgotPassword);
router.put('/reset/:token', resetPassword);

module.exports = router;

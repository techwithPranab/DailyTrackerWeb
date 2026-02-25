const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSettings,
  updateSettings,
  adminLogin,
  getActivityFeed
} = require('../controllers/adminController');

// Public admin login
router.post('/login', adminLogin);

// All routes below require auth + admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/activity-feed', getActivityFeed);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;

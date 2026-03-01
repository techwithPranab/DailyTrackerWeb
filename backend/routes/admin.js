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
  getPlanFeatureConfig,
  updatePlanFeatureConfig,
  adminLogin,
  getActivityFeed,
  getSubscriptions,
  getRevenueStats,
  adminUpdateSubscription,
  getTransactions
} = require('../controllers/adminController');
const {
  getContactMessages,
  getContactMessageById,
  updateContactMessage,
  deleteContactMessage,
} = require('../controllers/contactController');

// Public admin login
router.post('/login', adminLogin);

// All routes below require auth + admin role
router.use(protect, adminOnly);

router.get('/stats',         getStats);
router.get('/activity-feed', getActivityFeed);

router.get('/users',     getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Plan feature configuration
router.get('/plan-features', getPlanFeatureConfig);
router.put('/plan-features', updatePlanFeatureConfig);

// Subscription & revenue routes
router.get('/subscriptions',     getSubscriptions);
router.put('/subscriptions/:id', adminUpdateSubscription);
router.get('/revenue',           getRevenueStats);
router.get('/transactions',      getTransactions);

// Contact messages
router.get('/contact',      getContactMessages);
router.get('/contact/:id',  getContactMessageById);
router.put('/contact/:id',  updateContactMessage);
router.delete('/contact/:id', deleteContactMessage);

module.exports = router;

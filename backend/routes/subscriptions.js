const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { getPlanFeatures } = require('../config/planFeatures');
const {
  getPlans,
  createOrder,
  verifyPayment,
  getMySubscription,
  cancelSubscription,
  getInvoices,
  handleWebhook
} = require('../controllers/subscriptionController');

// Webhook — MUST use raw body for signature verification, no auth
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Public — plan catalogue
router.get('/plans', getPlans);

// Protected routes
router.use(protect);

// Returns current user's full feature set (used by frontend hook)
router.get('/features', (req, res) => {
  const plan     = req.user?.subscription?.plan ?? 'free';
  const features = getPlanFeatures(plan);
  res.json({ success: true, data: { plan, features } });
});

router.post('/create-order', createOrder);
router.post('/verify',       verifyPayment);
router.get('/me',            getMySubscription);
router.post('/cancel',       cancelSubscription);
router.get('/invoices',      getInvoices);

module.exports = router;

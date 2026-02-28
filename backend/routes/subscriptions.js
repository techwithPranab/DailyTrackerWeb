const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
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

router.post('/create-order', createOrder);
router.post('/verify',       verifyPayment);
router.get('/me',            getMySubscription);
router.post('/cancel',       cancelSubscription);
router.get('/invoices',      getInvoices);

module.exports = router;

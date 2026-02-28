const express = require('express');
const router  = express.Router();
const { getPublicPlans } = require('../controllers/publicSettingsController');

// GET /api/settings/plans — public, no auth required
router.get('/plans', getPublicPlans);

module.exports = router;

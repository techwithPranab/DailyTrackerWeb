const express = require('express');
const router  = express.Router();
const { submitContact } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// POST /api/contact  — public (guest + logged-in users)
// We use `protect` optionally: if a token is present it populates req.user, otherwise it's fine
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, submitContact);

module.exports = router;

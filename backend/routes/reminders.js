const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPlanLimit } = require('../middleware/planLimit');
const {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');

router.route('/')
  .post(protect, checkPlanLimit('reminder'), createReminder)
  .get(protect, getReminders);

router.route('/:id')
  .get(protect, getReminder)
  .put(protect, updateReminder)
  .delete(protect, deleteReminder);

module.exports = router;

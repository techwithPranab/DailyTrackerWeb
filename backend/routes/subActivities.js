const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSubActivitiesByDate,
  getSubActivitiesInRange,
  getMissedSubActivities,
  updateSubActivity
} = require('../controllers/subActivityController');

// GET  /api/subactivities?startDate=ISO&endDate=ISO  → date-range (used by calendar)
router.get('/', protect, getSubActivitiesInRange);

// GET  /api/subactivities/missed       → past incomplete sub-activities
router.get('/missed', protect, getMissedSubActivities);

// GET  /api/subactivities/date/:date   → all sub-activities for the current user on that date
router.get('/date/:date', protect, getSubActivitiesByDate);

// PUT  /api/subactivities/:id          → update status / notes of a single sub-activity
router.put('/:id', protect, updateSubActivity);

module.exports = router;

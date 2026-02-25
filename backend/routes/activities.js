const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  getTodayActivities
} = require('../controllers/activityController');
const {
  getWeeklyActivities,
  markActivityComplete,
  unmarkActivityComplete
} = require('../controllers/weeklyActivityController');

router.route('/')
  .post(protect, createActivity)
  .get(protect, getActivities);

router.get('/today', protect, getTodayActivities);
router.get('/weekly', protect, getWeeklyActivities);

router.route('/:id')
  .get(protect, getActivity)
  .put(protect, updateActivity)
  .delete(protect, deleteActivity);

router.post('/:id/complete', protect, markActivityComplete);
router.post('/:id/uncomplete', protect, unmarkActivityComplete);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPlanLimit, checkFeatureAccess } = require('../middleware/planLimit');
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
const { getSubActivities } = require('../controllers/subActivityController');
const { getActivityAnalytics } = require('../controllers/analyticsController');

router.route('/')
  .post(protect, checkPlanLimit('activity'), checkFeatureAccess('recurringActivities'), createActivity)
  .get(protect, getActivities);

router.get('/analytics', protect, checkFeatureAccess('analytics'), getActivityAnalytics);
router.get('/today', protect, getTodayActivities);
router.get('/weekly', protect, getWeeklyActivities);

router.route('/:id')
  .get(protect, getActivity)
  .put(protect, updateActivity)
  .delete(protect, deleteActivity);

router.post('/:id/complete',   protect, markActivityComplete);
router.post('/:id/uncomplete', protect, unmarkActivityComplete);

// Sub-activities for a parent activity
router.get('/:id/subactivities', protect, getSubActivities);

module.exports = router;

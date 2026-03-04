const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPlanLimit, checkFeatureAccess } = require('../middleware/planLimit');
const {
  createMilestone,
  getMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone
} = require('../controllers/milestoneController');
const { getMilestoneAnalytics } = require('../controllers/analyticsController');

router.route('/')
  .post(protect, checkPlanLimit('milestone'), createMilestone)
  .get(protect, getMilestones);

router.get('/analytics', protect, checkFeatureAccess('analytics'), getMilestoneAnalytics);

router.route('/:id')
  .get(protect, getMilestone)
  .put(protect, updateMilestone)
  .delete(protect, deleteMilestone);

module.exports = router;

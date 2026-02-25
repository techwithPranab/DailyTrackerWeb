const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createMilestone,
  getMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone
} = require('../controllers/milestoneController');

router.route('/')
  .post(protect, createMilestone)
  .get(protect, getMilestones);

router.route('/:id')
  .get(protect, getMilestone)
  .put(protect, updateMilestone)
  .delete(protect, deleteMilestone);

module.exports = router;

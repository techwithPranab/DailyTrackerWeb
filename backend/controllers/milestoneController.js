const Milestone = require('../models/Milestone');

// @desc    Create new milestone
// @route   POST /api/milestones
// @access  Private
const createMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.create({
      ...req.body,
      userId: req.body.userId || req.user._id
    });

    res.status(201).json({
      success: true,
      data: milestone
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all milestones
// @route   GET /api/milestones
// @access  Private
const getMilestones = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = {};
    // only fetch the current user's milestones
    query.userId = req.user._id;

    // Filter by completion status
    if (status) {
      query.completionStatus = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const milestones = await Milestone.find(query)
      .populate('userId', 'name email')
      .sort({ deadline: 1 });

    res.json({
      success: true,
      count: milestones.length,
      data: milestones
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single milestone
// @route   GET /api/milestones/:id
// @access  Private
const getMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('userId', 'name email');

    if (!milestone) {
      return res.status(404).json({ 
        success: false, 
        message: 'Milestone not found' 
      });
    }

    // Check authorization
    if (milestone.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this milestone' 
      });
    }

    res.json({
      success: true,
      data: milestone
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private
const updateMilestone = async (req, res) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ 
        success: false, 
        message: 'Milestone not found' 
      });
    }

    // Check authorization
    if (milestone.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this milestone' 
      });
    }

    // If marking as achieved, set achievedAt and progress to 100
    if (req.body.completionStatus === 'Achieved' && 
        milestone.completionStatus !== 'Achieved') {
      req.body.achievedAt = new Date();
      req.body.progress = 100;
    }

    milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: milestone
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private
const deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ 
        success: false, 
        message: 'Milestone not found' 
      });
    }

    // Check authorization
    if (milestone.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this milestone' 
      });
    }

    await milestone.deleteOne();

    res.json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  createMilestone,
  getMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone
};

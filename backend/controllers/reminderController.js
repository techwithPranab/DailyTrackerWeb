const Reminder = require('../models/Reminder');
const Activity = require('../models/Activity');

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res) => {
  try {
    const { activityId, reminderTime, message, type } = req.body;

    // Check if activity exists
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }

    // Check authorization
    if (activity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to create reminder for this activity' 
      });
    }

    const reminder = await Reminder.create({
      activityId,
      userId: activity.userId,
      reminderTime,
      message: message || `Reminder: ${activity.name}`,
      type: type || 'In-App'
    });

    const populatedReminder = await Reminder.findById(reminder._id)
      .populate('activityId', 'name description startTime')
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedReminder
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const { sent, upcoming } = req.query;
    
    let query = { userId: req.user._id };

    // Filter by notification sent status
    if (sent !== undefined) {
      query.notificationSent = sent === 'true';
    }

    // Filter upcoming reminders (not sent and time is in the future)
    if (upcoming === 'true') {
      query.notificationSent = false;
      query.reminderTime = { $gte: new Date() };
    }

    const reminders = await Reminder.find(query)
      .populate('activityId', 'name description startTime status')
      .populate('userId', 'name email')
      .sort({ reminderTime: 1 });

    res.json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
const getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('activityId', 'name description startTime')
      .populate('userId', 'name email');

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    // Check authorization
    if (reminder.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this reminder' 
      });
    }

    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update reminder (mark as sent)
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    // Check authorization
    if (reminder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this reminder' 
      });
    }

    // If marking as sent, set sentAt
    if (req.body.notificationSent === true && !reminder.notificationSent) {
      req.body.sentAt = new Date();
    }

    reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('activityId', 'name description startTime');

    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    // Check authorization
    if (reminder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this reminder' 
      });
    }

    await reminder.deleteOne();

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder
};

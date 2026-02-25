const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reminderTime: {
    type: Date,
    required: [true, 'Please add a reminder time']
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'You have an upcoming activity'
  },
  type: {
    type: String,
    enum: ['Email', 'Push', 'SMS', 'In-App'],
    default: 'In-App'
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
reminderSchema.index({ userId: 1, reminderTime: 1 });
reminderSchema.index({ notificationSent: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);

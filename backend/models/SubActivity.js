const mongoose = require('mongoose');

const subActivitySchema = new mongoose.Schema({
  parentActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true   // always midnight UTC of the day
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  notes: {
    type: String,
    default: ''
  },
  completionValue: {
    type: Number,
    default: 0,
    min: 0
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Prevent duplicate entries for the same activity + day
subActivitySchema.index(
  { parentActivityId: 1, scheduledDate: 1 },
  { unique: true }
);

// Fast lookups
subActivitySchema.index({ userId: 1, scheduledDate: 1 });
subActivitySchema.index({ parentActivityId: 1, status: 1 });

module.exports = mongoose.model('SubActivity', subActivitySchema);

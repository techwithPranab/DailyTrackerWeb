const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a milestone name'],
    trim: true
  },
  target: {
    type: String,
    required: [true, 'Please add a target description'],
    trim: true
  },
  completionStatus: {
    type: String,
    enum: ['Pending', 'Achieved'],
    default: 'Pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    enum: ['Personal', 'Academic', 'Health', 'Family', 'Other'],
    default: 'Other'
  },
  achievedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
milestoneSchema.index({ userId: 1, deadline: 1 });
milestoneSchema.index({ completionStatus: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);

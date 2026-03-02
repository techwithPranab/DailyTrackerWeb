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
  },
  // ── Activity-linked auto-progress ─────────────────────────────────────────
  linkedActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    default: null
  },
  metric: {
    type: String,
    enum: ['Min', 'Hr', 'Km', 'Mi', 'L', 'ml', 'lb', 'kg', 'reps', 'steps', 'pages', 'sessions', 'custom', 'occurrences'],
    default: 'occurrences'   // 'occurrences' = count-based (legacy behaviour)
  },
  targetValue: {
    type: Number,            // target accumulated value (or count) to reach 100%
    default: null,
    min: 0
  },
  accumulatedValue: {
    type: Number,            // auto-managed running total
    default: 0,
    min: 0
  },
  // Legacy — kept so existing milestones using count-mode still work
  targetCount: {
    type: Number,
    default: null,
    min: 1
  },
  completedCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
milestoneSchema.index({ userId: 1, deadline: 1 });
milestoneSchema.index({ completionStatus: 1 });
milestoneSchema.index({ linkedActivityId: 1 });   // for auto-progress lookups

module.exports = mongoose.model('Milestone', milestoneSchema);

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an activity name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  startTime: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: ['Chores', 'School', 'Fitness', 'Hobby', 'Other'],
    default: 'Other'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', null],
    default: null
  },
  recurrenceDays: {
    type: [Number], // For weekly: 0=Sunday, 1=Monday, etc.
    default: []
  },
  recurrenceMonthDay: {
    type: Number, // For monthly: day of month (1-31)
    default: null
  },
  recurrenceEndDate: {
    type: Date
  },
  scheduledDates: {
    type: [Date], // Pre-computed list of all scheduled dates
    default: []
  },
  parentActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  weeklyCompletions: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
activitySchema.index({ userId: 1, startDate: -1 });
activitySchema.index({ userId: 1, scheduledDates: 1 });
activitySchema.index({ status: 1 });

module.exports = mongoose.model('Activity', activitySchema);

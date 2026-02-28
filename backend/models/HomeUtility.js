const mongoose = require('mongoose');

const serviceEntrySchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: [true, 'Please add a service type'],
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please add a scheduled date']
  },
  completedDate: {
    type: Date,
    default: null
  },
  cost: {
    type: Number,
    default: 0
  },
  technician: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Missed'],
    default: 'Upcoming'
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, { _id: true, timestamps: true });

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Warranty', 'Manual', 'Invoice', 'ServiceReport', 'Other'],
    default: 'Other'
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const homeUtilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a utility name'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Appliance', 'Plumbing', 'Electrical', 'HVAC', 'Vehicle', 'Other'],
    default: 'Appliance'
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  modelNumber: {
    type: String,
    trim: true,
    default: ''
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  warrantyExpiryDate: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Disposed'],
    default: 'Active'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceSchedule: [serviceEntrySchema],
  documents: [documentSchema]
}, {
  timestamps: true
});

homeUtilitySchema.index({ userId: 1, status: 1 });
homeUtilitySchema.index({ userId: 1, category: 1 });
homeUtilitySchema.index({ userId: 1, 'serviceSchedule.scheduledDate': 1 });

module.exports = mongoose.model('HomeUtility', homeUtilitySchema);

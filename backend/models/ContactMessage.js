const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 120 },
  email:   { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },

  // Which user submitted this (optional — guest submissions allowed)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    default: null,
  },

  // Admin workflow
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new',
    index: true,
  },
  adminNote: { type: String, default: '', maxlength: 2000 },
  resolvedAt: { type: Date, default: null },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    default: null,
  },

  // Source metadata
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

// Index for fast admin list queries
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);

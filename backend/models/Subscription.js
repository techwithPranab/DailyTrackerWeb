const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  razorpayPaymentId: { type: String, required: true },
  amount:            { type: Number, required: true },   // in paise
  currency:          { type: String, default: 'INR' },
  paidAt:            { type: Date,   default: Date.now },
  invoiceUrl:        { type: String }
}, { _id: true });

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'active', 'cancelled', 'expired', 'failed'],
    default: 'created'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  amount: { type: Number, default: 0 },       // in paise
  currency: { type: String, default: 'INR' },

  // Razorpay identifiers
  razorpayOrderId:        { type: String, index: true, sparse: true },
  razorpayPaymentId:      { type: String, index: true, sparse: true },
  razorpaySignature:      { type: String },

  // Billing dates
  startDate:       { type: Date },
  endDate:         { type: Date },
  nextBillingDate: { type: Date },

  // Cancellation
  cancelledAt:  { type: Date },
  cancelReason: { type: String },

  // Invoice history
  invoices: [invoiceSchema]
}, {
  timestamps: true
});

// Indexes for admin queries
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

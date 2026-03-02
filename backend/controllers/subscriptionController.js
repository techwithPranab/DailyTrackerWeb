const crypto       = require('crypto');
const razorpay     = require('../config/razorpay');
const Subscription = require('../models/Subscription');
const User         = require('../models/User');
const AppSettings  = require('../models/AppSettings');

// ─── Static price fallbacks (paise) used when AppSettings has no DB record ───
const PRICE_FALLBACK = {
  free: { monthly: 0,     yearly: 0      },
  pro:  { monthly: 19900, yearly: 199000 },  // ₹199/mo  |  ₹1990/yr
};

/**
 * Load plan prices from AppSettings (DB).
 * Returns { monthly: <paise>, yearly: <paise> } for the given plan key.
 * Falls back to PRICE_FALLBACK if the DB document is absent or has 0
 * for a field (meaning it was created before that field existed in the schema).
 */
const getPlanPrices = async (plan) => {
  try {
    const settings = await AppSettings.findById('global').lean();
    const p        = settings?.plans?.[plan];
    const fallback = PRICE_FALLBACK[plan] ?? PRICE_FALLBACK.free;
    if (p) {
      // AppSettings stores prices in ₹ — convert to paise for Razorpay.
      // If the DB value is 0 (never explicitly saved), use the static fallback
      // so an old document doesn't silently zero-out yearly pricing.
      const monthly = p.price       ? Math.round(p.price       * 100) : fallback.monthly;
      const yearly  = p.yearlyPrice ? Math.round(p.yearlyPrice * 100) : fallback.yearly;
      return { monthly, yearly };
    }
  } catch (_) { /* fall through */ }
  return PRICE_FALLBACK[plan] ?? PRICE_FALLBACK.free;
};

// ─── GET /api/subscriptions/plans ─────────────────────────────────────────────
// Delegates to the public settings controller which already reads from AppSettings
const getPlans = async (req, res) => {
  try {
    const settings = await AppSettings.findById('global').lean();
    const DEFAULTS = {
      free: { name: 'Free', price: { monthly: 0, yearly: 0 } },
      pro:  { name: 'Pro',  price: { monthly: 19900, yearly: 199000 } },
    };
    if (!settings?.plans) return res.json({ success: true, data: DEFAULTS });

    const toCard = (key, p) => {
      const fb = PRICE_FALLBACK[key] ?? PRICE_FALLBACK.free;
      return {
        name:     p?.name    ?? key,
        price:    {
          monthly: p?.price       ? Math.round(p.price       * 100) : fb.monthly,
          yearly:  p?.yearlyPrice ? Math.round(p.yearlyPrice * 100) : fb.yearly,
        },
        currency: 'INR',
      };
    };

    res.json({
      success: true,
      data: {
        free: toCard('free', settings.plans.free),
        pro:  toCard('pro',  settings.plans.pro),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/subscriptions/create-order ─────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { plan, billingCycle = 'monthly' } = req.body;

    const validPlans = ['free', 'pro'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    if (plan === 'free') {
      return res.status(400).json({ success: false, message: 'Free plan does not require payment' });
    }
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ success: false, message: 'Invalid billing cycle' });
    }

    // ── Load price from AppSettings (DB) with static fallback ──────────────
    const prices = await getPlanPrices(plan);
    const amount = prices[billingCycle];
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Price not configured for this plan and billing cycle' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${req.user._id.toString().slice(-8)}_${Date.now().toString().slice(-10)}`,
      notes: {
        userId:       req.user._id.toString(),
        plan,
        billingCycle,
        userEmail:    req.user.email,
        userName:     req.user.name
      }
    });

    // Record pending subscription
    const subscription = await Subscription.create({
      userId:          req.user._id,
      plan,
      status:          'created',
      billingCycle,
      amount,
      currency:        'INR',
      razorpayOrderId: order.id
    });

    res.status(201).json({
      success: true,
      data: {
        orderId:   order.id,
        amount,
        currency:  'INR',
        keyId:     process.env.RAZORPAY_KEY_ID,
        plan,
        billingCycle,
        subscriptionDbId: subscription._id,
        prefill: {
          name:  req.user.name,
          email: req.user.email
        }
      }
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/subscriptions/verify ───────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, subscriptionDbId } = req.body;

    // Signature verification
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    // Find the pending subscription record
    const subscription = await Subscription.findById(subscriptionDbId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription record not found' });
    }

    // Compute billing dates
    const now = new Date();
    const endDate = new Date(now);
    if (subscription.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Activate subscription
    subscription.status           = 'active';
    subscription.razorpayPaymentId = razorpayPaymentId;
    subscription.razorpaySignature = razorpaySignature;
    subscription.startDate         = now;
    subscription.endDate           = endDate;
    subscription.nextBillingDate   = endDate;
    subscription.invoices.push({
      razorpayPaymentId,
      amount:   subscription.amount,
      currency: 'INR',
      paidAt:   now
    });
    await subscription.save();

    // Update User.subscription
    await User.findByIdAndUpdate(subscription.userId, {
      'subscription.plan':      subscription.plan,
      'subscription.status':    'active',
      'subscription.startDate': now,
      'subscription.endDate':   endDate
    });

    res.json({
      success: true,
      message: `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan activated!`,
      data: subscription
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/subscriptions/me ────────────────────────────────────────────────
const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: { $in: ['active', 'created', 'cancelled'] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        subscription,
        currentPlan: req.user.subscription
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/subscriptions/cancel ───────────────────────────────────────────
const cancelSubscription = async (req, res) => {
  try {
    const { reason = '' } = req.body;

    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found' });
    }

    subscription.status       = 'cancelled';
    subscription.cancelledAt  = new Date();
    subscription.cancelReason = reason;
    await subscription.save();

    // Downgrade user to free at endDate (mark in User model)
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.status': 'cancelled'
    });

    res.json({
      success: true,
      message: 'Subscription cancelled. Access continues until end of billing period.',
      data: { endDate: subscription.endDate }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/subscriptions/invoices ─────────────────────────────────────────
const getInvoices = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.user._id,
      'invoices.0': { $exists: true }
    }).sort({ createdAt: -1 });

    const invoices = [];
    subscriptions.forEach(sub => {
      sub.invoices.forEach(inv => {
        invoices.push({
          _id:              inv._id,
          razorpayPaymentId: inv.razorpayPaymentId,
          amount:           inv.amount,
          currency:         inv.currency,
          paidAt:           inv.paidAt,
          plan:             sub.plan,
          billingCycle:     sub.billingCycle
        });
      });
    });

    invoices.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/subscriptions/webhook ─────────────────────────────────────────
// Called by Razorpay with raw body — must use express.raw() middleware on this route
const handleWebhook = async (req, res) => {
  try {
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (secret) {
      const digest = crypto
        .createHmac('sha256', secret)
        .update(req.body)   // raw Buffer
        .digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event   = JSON.parse(req.body.toString());
    const payload = event.payload?.payment?.entity;

    if (event.event === 'payment.captured' && payload) {
      const orderId = payload.order_id;
      const sub = await Subscription.findOne({ razorpayOrderId: orderId });
      if (sub && sub.status !== 'active') {
        // Auto-activate if verify endpoint was not called
        sub.status            = 'active';
        sub.razorpayPaymentId = payload.id;
        sub.startDate         = new Date();
        if (sub.billingCycle === 'yearly') {
          const end = new Date(); end.setFullYear(end.getFullYear() + 1);
          sub.endDate = end;
        } else {
          const end = new Date(); end.setMonth(end.getMonth() + 1);
          sub.endDate = end;
        }
        sub.invoices.push({ razorpayPaymentId: payload.id, amount: payload.amount });
        await sub.save();
        await User.findByIdAndUpdate(sub.userId, {
          'subscription.plan':   sub.plan,
          'subscription.status': 'active',
          'subscription.endDate': sub.endDate
        });
      }
    }

    if (event.event === 'payment.failed' && payload) {
      const orderId = payload.order_id;
      await Subscription.findOneAndUpdate(
        { razorpayOrderId: orderId, status: 'created' },
        { status: 'failed' }
      );
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPlans,
  createOrder,
  verifyPayment,
  getMySubscription,
  cancelSubscription,
  getInvoices,
  handleWebhook
};

const User         = require('../models/User');
const Activity     = require('../models/Activity');
const Milestone    = require('../models/Milestone');
const Reminder     = require('../models/Reminder');
const AppSettings  = require('../models/AppSettings');
const Subscription = require('../models/Subscription');

// ─── Helper ─────────────────────────────────────────────────────────────────
const getOrCreateSettings = async () => {
  let settings = await AppSettings.findById('global');
  if (!settings) {
    settings = await AppSettings.create({ _id: 'global' });
  }
  return settings;
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      freePlan,
      proPlan,
      totalActivities,
      totalMilestones,
      totalReminders,
      newUsersThisMonth
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', status: 'active' }),
      User.countDocuments({ role: 'user', status: 'suspended' }),
      User.countDocuments({ role: 'user', 'subscription.plan': 'free' }),
      User.countDocuments({ role: 'user', 'subscription.plan': 'pro' }),
      Activity.countDocuments(),
      Milestone.countDocuments(),
      Reminder.countDocuments(),
      User.countDocuments({
        role: 'user',
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, newThisMonth: newUsersThisMonth },
        subscriptions: { free: freePlan, pro: proPlan },
        content: { activities: totalActivities, milestones: totalMilestones, reminders: totalReminders }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const planFilter = req.query.plan || '';
    const statusFilter = req.query.status || '';

    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (planFilter) query['subscription.plan'] = planFilter;
    if (statusFilter) query.status = statusFilter;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    // Attach activity counts per user
    const userIds = users.map(u => u._id);
    const activityCounts = await Activity.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    activityCounts.forEach(a => { countMap[a._id.toString()] = a.count; });

    const enriched = users.map(u => ({
      ...u.toObject(),
      activityCount: countMap[u._id.toString()] || 0
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [activities, milestones, reminders] = await Promise.all([
      Activity.countDocuments({ user: user._id }),
      Milestone.countDocuments({ user: user._id }),
      Reminder.countDocuments({ user: user._id })
    ]);

    res.json({
      success: true,
      data: { ...user.toObject(), stats: { activities, milestones, reminders } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, status, subscription } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify admin accounts' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (status) user.status = status;
    if (subscription) {
      user.subscription = { ...user.subscription.toObject(), ...subscription };
    }

    const updated = await user.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin accounts' });
    }

    // Mark as deleted (soft delete)
    user.status = 'deleted';
    await user.save();

    res.json({ success: true, message: 'User marked as deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── App Settings ─────────────────────────────────────────────────────────────
// @route GET /api/admin/settings
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/settings
const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const allowed = [
      'appName', 'appTagline', 'appLogoUrl',
      'supportEmail', 'privacyEmail', 'websiteUrl', 'twitterHandle',
      'plans', 'features', 'announcement'
    ];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
          settings[key] = { ...settings[key]?.toObject?.() || settings[key], ...req.body[key] };
        } else {
          settings[key] = req.body[key];
        }
      }
    });
    settings.markModified('plans');
    settings.markModified('features');
    settings.markModified('announcement');
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Plan Feature Config ──────────────────────────────────────────────────────
// @route GET  /api/admin/plan-features
const getPlanFeatureConfig = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings.plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT  /api/admin/plan-features
const updatePlanFeatureConfig = async (req, res) => {
  try {
    const { free, pro } = req.body;
    const settings = await getOrCreateSettings();

    if (free) {
      settings.plans.free = { ...settings.plans.free?.toObject?.() ?? {}, ...free };
    }
    if (pro) {
      settings.plans.pro = { ...settings.plans.pro?.toObject?.() ?? {}, ...pro };
    }
    settings.markModified('plans');
    await settings.save();
    res.json({ success: true, data: settings.plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin Login ──────────────────────────────────────────────────────────────
// @route POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const generateToken = require('../utils/generateToken');
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Recent Activity Feed ─────────────────────────────────────────────────────
// @route GET /api/admin/activity-feed
const getActivityFeed = async (req, res) => {
  try {
    const recentUsers = await User.find({ role: 'user' })
      .select('name email createdAt status subscription')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentActivities = await Activity.find()
      .populate('userId', 'name email')
      .select('name status createdAt userId')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: { recentUsers, recentActivities }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSettings,
  updateSettings,
  getPlanFeatureConfig,
  updatePlanFeatureConfig,
  adminLogin,
  getActivityFeed,
  getSubscriptions,
  getRevenueStats,
  adminUpdateSubscription,
  getTransactions
};

// ─── Admin: All Subscriptions ─────────────────────────────────────────────────
// @route GET /api/admin/subscriptions
async function getSubscriptions(req, res) {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const skip   = (page - 1) * limit;
    const { plan, status, search } = req.query;

    // Build user filter for search
    let userIds;
    if (search) {
      const matchedUsers = await User.find({
        $or: [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      userIds = matchedUsers.map(u => u._id);
    }

    const query = {};
    if (plan)    query.plan   = plan;
    if (status)  query.status = status;
    if (userIds) query.userId = { $in: userIds };

    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate('userId', 'name email status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Subscription.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: subscriptions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: Revenue Stats ─────────────────────────────────────────────────────
// @route GET /api/admin/revenue
async function getRevenueStats(req, res) {
  try {
    // All active paid subscriptions
    const activeSubscriptions = await Subscription.find({ status: 'active', plan: { $ne: 'free' } });

    // MRR calculation
    let mrr = 0;
    activeSubscriptions.forEach(s => {
      if (s.billingCycle === 'yearly') {
        mrr += Math.round(s.amount / 12);
      } else {
        mrr += s.amount;
      }
    });

    // Total revenue (all invoices)
    const allSubs = await Subscription.find({ 'invoices.0': { $exists: true } });
    let totalRevenue = 0;
    const monthlyBreakdown = {};

    allSubs.forEach(sub => {
      sub.invoices.forEach(inv => {
        totalRevenue += inv.amount;
        const month = new Date(inv.paidAt).toISOString().slice(0, 7); // YYYY-MM
        monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + inv.amount;
      });
    });

    // Plan counts for active subs
    const [proCount] = await Promise.all([
      Subscription.countDocuments({ status: 'active', plan: 'pro' })
    ]);

    // Build sorted monthly array for chart
    const months = Object.entries(monthlyBreakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount }));

    res.json({
      success: true,
      data: {
        mrr,
        totalRevenue,
        activePaidUsers: proCount,
        proCount,
        monthlyBreakdown: months
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: Manually update a subscription ───────────────────────────────────
// @route PUT /api/admin/subscriptions/:id
async function adminUpdateSubscription(req, res) {
  try {
    const { plan, status, endDate } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

    if (plan)    subscription.plan    = plan;
    if (status)  subscription.status  = status;
    if (endDate) subscription.endDate = new Date(endDate);
    await subscription.save();

    // Sync User model
    const userUpdate = {};
    if (plan)   userUpdate['subscription.plan']    = plan;
    if (status) userUpdate['subscription.status']  = status;
    if (endDate) userUpdate['subscription.endDate'] = new Date(endDate);
    if (Object.keys(userUpdate).length) {
      await User.findByIdAndUpdate(subscription.userId, userUpdate);
    }

    res.json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: All Transactions (invoices flattened) ────────────────────────────
// @route GET /api/admin/transactions
async function getTransactions(req, res) {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const subsWithInvoices = await Subscription.find({ 'invoices.0': { $exists: true } })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Flatten all invoices
    const transactions = [];
    subsWithInvoices.forEach(sub => {
      sub.invoices.forEach(inv => {
        transactions.push({
          _id:               inv._id,
          razorpayPaymentId: inv.razorpayPaymentId,
          amount:            inv.amount,
          currency:          inv.currency,
          paidAt:            inv.paidAt,
          plan:              sub.plan,
          billingCycle:      sub.billingCycle,
          user: {
            _id:   sub.userId?._id,
            name:  sub.userId?.name,
            email: sub.userId?.email
          }
        });
      });
    });

    // Sort by paidAt desc, then paginate
    transactions.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    const total   = transactions.length;
    const paged   = transactions.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paged,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

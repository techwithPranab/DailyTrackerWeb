const User = require('../models/User');
const Activity = require('../models/Activity');
const Milestone = require('../models/Milestone');
const Reminder = require('../models/Reminder');
const AppSettings = require('../models/AppSettings');

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
      enterprisePlan,
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
      User.countDocuments({ role: 'user', 'subscription.plan': 'enterprise' }),
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
        subscriptions: { free: freePlan, pro: proPlan, enterprise: enterprisePlan },
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
      .populate('user', 'name email')
      .select('title type createdAt user')
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
  adminLogin,
  getActivityFeed
};

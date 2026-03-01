const ContactMessage = require('../models/ContactMessage');

// ─── POST /api/contact ────────────────────────────────────────────────────────
// Public — no auth required. Saves a contact form submission.
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const ip        = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const doc = await ContactMessage.create({
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      subject:   subject.trim(),
      message:   message.trim(),
      userId:    req.user?._id ?? null,   // populated if user is logged in
      ipAddress: ip,
      userAgent,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you within 24 hours.',
      data:    { id: doc._id },
    });
  } catch (err) {
    console.error('submitContact error:', err);
    res.status(500).json({ success: false, message: 'Could not save your message. Please try again.' });
  }
};

// ─── GET /api/admin/contact ────────────────────────────────────────────────────
// Admin — paginated list with search + status filter
const getContactMessages = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const re = { $regex: search, $options: 'i' };
      filter.$or = [{ name: re }, { email: re }, { subject: re }];
    }

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(filter),
    ]);

    // Status counts for the header badges
    const [newCount, inProgressCount, resolvedCount, closedCount] = await Promise.all([
      ContactMessage.countDocuments({ status: 'new' }),
      ContactMessage.countDocuments({ status: 'in_progress' }),
      ContactMessage.countDocuments({ status: 'resolved' }),
      ContactMessage.countDocuments({ status: 'closed' }),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: { page, pages: Math.ceil(total / limit), total },
      counts: { new: newCount, in_progress: inProgressCount, resolved: resolvedCount, closed: closedCount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/contact/:id ───────────────────────────────────────────────
const getContactMessageById = async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id).lean();
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/admin/contact/:id ───────────────────────────────────────────────
// Update status and/or adminNote
const updateContactMessage = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const allowed = ['new', 'in_progress', 'resolved', 'closed'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const update = {};
    if (status)    update.status    = status;
    if (adminNote !== undefined) update.adminNote = adminNote;

    // Record resolution time when marked resolved or closed
    if (status === 'resolved' || status === 'closed') {
      update.resolvedAt = new Date();
      update.resolvedBy = req.user?._id ?? null;
    }

    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/admin/contact/:id ───────────────────────────────────────────
const deleteContactMessage = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  submitContact,
  getContactMessages,
  getContactMessageById,
  updateContactMessage,
  deleteContactMessage,
};

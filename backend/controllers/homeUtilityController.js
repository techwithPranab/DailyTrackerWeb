const HomeUtility = require('../models/HomeUtility');
const cloudinary   = require('../config/cloudinary');

// ─── helpers ─────────────────────────────────────────────────────────────────

const ownershipCheck = async (id, userId) => {
  const utility = await HomeUtility.findById(id);
  if (!utility) return { error: 'Utility not found', status: 404 };
  if (utility.userId.toString() !== userId.toString()) return { error: 'Not authorised', status: 403 };
  return { utility };
};

// ─── CRUD ─────────────────────────────────────────────────────────────────────

// @desc  Create a home utility
// @route POST /api/utilities
const createUtility = async (req, res) => {
  try {
    const utility = await HomeUtility.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: utility });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Get all utilities for current user
// @route GET /api/utilities
const getUtilities = async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = { userId: req.user._id };
    if (category) query.category = category;
    if (status)   query.status   = status;

    const utilities = await HomeUtility.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: utilities.length, data: utilities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single utility
// @route GET /api/utilities/:id
const getUtility = async (req, res) => {
  try {
    const { error, status, utility } = await ownershipCheck(req.params.id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });
    res.json({ success: true, data: utility });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update utility
// @route PUT /api/utilities/:id
const updateUtility = async (req, res) => {
  try {
    const { error, status } = await ownershipCheck(req.params.id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    // Prevent overwriting subdocs via this route
    delete req.body.serviceSchedule;
    delete req.body.documents;
    delete req.body.userId;

    const updated = await HomeUtility.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Delete utility (also purges Cloudinary documents)
// @route DELETE /api/utilities/:id
const deleteUtility = async (req, res) => {
  try {
    const { error, status, utility } = await ownershipCheck(req.params.id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    // Delete all Cloudinary assets
    const publicIds = utility.documents.map(d => d.cloudinaryPublicId).filter(Boolean);
    if (publicIds.length > 0) {
      await Promise.allSettled(publicIds.map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'auto' })));
    }

    await utility.deleteOne();
    res.json({ success: true, message: 'Utility deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Service schedule ─────────────────────────────────────────────────────────

// @desc  Add a service entry
// @route POST /api/utilities/:id/services
const addServiceEntry = async (req, res) => {
  try {
    const { error, status, utility } = await ownershipCheck(req.params.id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    utility.serviceSchedule.push(req.body);
    await utility.save();
    res.status(201).json({ success: true, data: utility });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Update a service entry
// @route PUT /api/utilities/:id/services/:sid
const updateServiceEntry = async (req, res) => {
  try {
    const { error, status, utility } = await ownershipCheck(req.params.id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const entry = utility.serviceSchedule.id(req.params.sid);
    if (!entry) return res.status(404).json({ success: false, message: 'Service entry not found' });

    Object.assign(entry, req.body);
    await utility.save();
    res.json({ success: true, data: utility });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Delete a service entry
// @route DELETE /api/utilities/:id/services/:sid
const deleteServiceEntry = async (req, res) => {
  try {
    const { error, status, utility } = await ownershipCheck(req.params.id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    utility.serviceSchedule = utility.serviceSchedule.filter(
      s => s._id.toString() !== req.params.sid
    );
    await utility.save();
    res.json({ success: true, data: utility });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Documents ───────────────────────────────────────────────────────────────

// @desc  Upload a document to Cloudinary
// @route POST /api/utilities/:id/documents  (multipart/form-data)
const uploadDocument = async (req, res) => {
  try {
    const { error, status, utility } = await ownershipCheck(req.params.id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    utility.documents.push({
      name:               req.body.name || req.file.originalname,
      type:               req.body.type || 'Other',
      cloudinaryUrl:      req.file.path,
      cloudinaryPublicId: req.file.filename
    });

    await utility.save();
    res.status(201).json({ success: true, data: utility });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete a document (purge from Cloudinary)
// @route DELETE /api/utilities/:id/documents/:did
const deleteDocument = async (req, res) => {
  try {
    const { error, status, utility } = await ownershipCheck(req.params.id, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const doc = utility.documents.id(req.params.did);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Purge from Cloudinary (best-effort)
    if (doc.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(doc.cloudinaryPublicId, { resource_type: 'auto' }).catch(() => {});
    }

    utility.documents = utility.documents.filter(d => d._id.toString() !== req.params.did);
    await utility.save();
    res.json({ success: true, data: utility });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Upcoming services ────────────────────────────────────────────────────────

// @desc  Get all upcoming service entries in the next 30 days
// @route GET /api/utilities/services/upcoming
const getUpcomingServices = async (req, res) => {
  try {
    const now     = new Date();
    const in30    = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in7     = new Date(now.getTime() +  7 * 24 * 60 * 60 * 1000);

    const utilities = await HomeUtility.find({
      userId: req.user._id,
      status: 'Active',
      'serviceSchedule.scheduledDate': { $gte: now, $lte: in30 },
      'serviceSchedule.status': 'Upcoming'
    });

    const upcoming = [];
    for (const u of utilities) {
      for (const s of u.serviceSchedule) {
        if (
          s.status === 'Upcoming' &&
          s.scheduledDate >= now &&
          s.scheduledDate <= in30
        ) {
          upcoming.push({
            utilityId:    u._id,
            utilityName:  u.name,
            category:     u.category,
            serviceId:    s._id,
            serviceType:  s.serviceType,
            scheduledDate: s.scheduledDate,
            daysUntilDue: Math.ceil((s.scheduledDate - now) / (1000 * 60 * 60 * 24)),
            isDueSoon:    s.scheduledDate <= in7,
            reminderSent: s.reminderSent
          });
        }
      }
    }

    upcoming.sort((a, b) => a.scheduledDate - b.scheduledDate);

    res.json({ success: true, count: upcoming.length, data: upcoming });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createUtility,
  getUtilities,
  getUtility,
  updateUtility,
  deleteUtility,
  addServiceEntry,
  updateServiceEntry,
  deleteServiceEntry,
  uploadDocument,
  deleteDocument,
  getUpcomingServices
};

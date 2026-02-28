const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const upload  = require('../middleware/upload');
const {
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
} = require('../controllers/homeUtilityController');

// Upcoming services (must be before /:id to avoid param clash)
router.get('/services/upcoming', protect, getUpcomingServices);

// Utility CRUD
router.route('/')
  .get(protect, getUtilities)
  .post(protect, createUtility);

router.route('/:id')
  .get(protect, getUtility)
  .put(protect, updateUtility)
  .delete(protect, deleteUtility);

// Service schedule entries
router.post('/:id/services',              protect, addServiceEntry);
router.put('/:id/services/:sid',          protect, updateServiceEntry);
router.delete('/:id/services/:sid',       protect, deleteServiceEntry);

// Documents (Cloudinary upload)
router.post('/:id/documents',             protect, upload.single('file'), uploadDocument);
router.delete('/:id/documents/:did',      protect, deleteDocument);

module.exports = router;

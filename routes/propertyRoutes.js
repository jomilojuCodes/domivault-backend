const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  getMyListings,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, landlordOnly } = require('../middleware/authMiddleware');
const { uploadPropertyImages } = require('../config/cloudinary');

// Public routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Private routes
router.post('/', protect, landlordOnly, uploadPropertyImages.array('images', 10), createProperty);
router.get('/landlord/my-listings', protect, landlordOnly, getMyListings);
router.put('/:id', protect, landlordOnly, updateProperty);
router.delete('/:id', protect, landlordOnly, deleteProperty);

module.exports = router;
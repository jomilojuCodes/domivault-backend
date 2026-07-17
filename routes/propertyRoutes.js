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

// Private routes — specific paths MUST come before /:id, or Express will
// match "/landlord/my-listings" against /:id first and treat "landlord"
// as the id, causing a 404 that never reaches getMyListings.
router.get('/landlord/my-listings', protect, landlordOnly, getMyListings);
router.post('/', protect, landlordOnly, uploadPropertyImages.array('images', 10), createProperty);
router.put('/:id', protect, landlordOnly, updateProperty);
router.delete('/:id', protect, landlordOnly, deleteProperty);

// Public route with a param — must come after the specific routes above
router.get('/:id', getPropertyById);

module.exports = router;
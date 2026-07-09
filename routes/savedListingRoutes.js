const express = require('express');
const router = express.Router();
const {
  saveProperty,
  unsaveProperty,
  getSavedListings,
  checkSaved,
} = require('../controllers/savedListingController');
const { protect } = require('../middleware/authMiddleware');

// All routes are private
router.get('/', protect, getSavedListings);
router.post('/:propertyId', protect, saveProperty);
router.delete('/:propertyId', protect, unsaveProperty);
router.get('/check/:propertyId', protect, checkSaved);

module.exports = router;
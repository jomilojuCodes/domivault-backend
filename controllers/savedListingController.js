const SavedListing = require('../models/SavedListing');
const Property = require('../models/Property');

// @desc    Save a property
// @route   POST /api/saved/:propertyId
// @access  Private (tenant)
const saveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already saved
    const alreadySaved = await SavedListing.findOne({
      tenant: req.user._id,
      property: req.params.propertyId,
    });

    if (alreadySaved) {
      return res.status(400).json({ message: 'Property already saved' });
    }

    const saved = await SavedListing.create({
      tenant: req.user._id,
      property: req.params.propertyId,
    });

    res.status(201).json({ message: 'Property saved', saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unsave a property
// @route   DELETE /api/saved/:propertyId
// @access  Private (tenant)
const unsaveProperty = async (req, res) => {
  try {
    const saved = await SavedListing.findOneAndDelete({
      tenant: req.user._id,
      property: req.params.propertyId,
    });

    if (!saved) {
      return res.status(404).json({ message: 'Saved listing not found' });
    }

    res.json({ message: 'Property removed from saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all saved properties for tenant
// @route   GET /api/saved
// @access  Private (tenant)
const getSavedListings = async (req, res) => {
  try {
    const saved = await SavedListing.find({ tenant: req.user._id })
      .populate({
        path: 'property',
        populate: {
          path: 'landlord',
          select: 'name email phone avatar',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out any null properties
    const validSaved = saved.filter(s => s.property !== null);

    res.json(validSaved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if a property is saved
// @route   GET /api/saved/check/:propertyId
// @access  Private (tenant)
const checkSaved = async (req, res) => {
  try {
    const saved = await SavedListing.findOne({
      tenant: req.user._id,
      property: req.params.propertyId,
    });

    res.json({ isSaved: !!saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveProperty,
  unsaveProperty,
  getSavedListings,
  checkSaved,
};
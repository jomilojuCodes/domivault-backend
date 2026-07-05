const Property = require('../models/Property');

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (landlord only)
const createProperty = async (req, res) => {
  try {
    const {
      title, description, price, type,
      bedrooms, bathrooms, parking, size,
      furnishing, amenities, availableFrom,
      address, area, state, landmarks,
    } = req.body;

    // Get uploaded image URLs from Cloudinary
    const images = req.files ? req.files.map((file) => file.path) : [];

    const property = await Property.create({
      title,
      description,
      price,
      type,
      bedrooms,
      bathrooms,
      parking,
      size,
      furnishing,
      amenities: amenities ? amenities.split(',') : [],
      images,
      availableFrom,
      location: {
        address,
        area,
        state: state || 'Lagos',
        landmarks: landmarks ? landmarks.split(',') : [],
      },
      landlord: req.user._id,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all live inspected properties
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const { area, minPrice, maxPrice, bedrooms, type } = req.query;

    // Only show inspected and approved listings to tenants
    let filter = { isInspected: true, isApproved: true, status: 'live' };

    if (area) filter['location.area'] = { $regex: area, $options: 'i' };
    if (type) filter.type = type;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter)
      .populate('landlord', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('landlord', 'name email phone avatar');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get landlord's own properties
// @route   GET /api/properties/my-listings
// @access  Private (landlord only)
const getMyListings = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id })
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (landlord only)
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Make sure landlord owns this property
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (landlord only)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await property.deleteOne();
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  getMyListings,
  updateProperty,
  deleteProperty,
};
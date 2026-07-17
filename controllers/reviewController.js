const Review = require('../models/Review');
const Property = require('../models/Property');

// @desc    Create a review for a property
// @route   POST /api/reviews
// @access  Private (tenant only)
const createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    if (!propertyId || !rating || !comment) {
      return res
        .status(400)
        .json({ message: 'propertyId, rating and comment are required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const review = await Review.create({
      property: propertyId,
      landlord: property.landlord,
      tenant: req.user._id,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a specific property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('tenant', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for the logged-in landlord, with summary stats
// @route   GET /api/reviews/landlord/my-reviews
// @access  Private (landlord only)
const getLandlordReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ landlord: req.user._id })
      .populate('tenant', 'name avatar')
      .populate('property', 'title location')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const averageRating =
      total > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10
          ) / 10
        : 0;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      breakdown[r.rating] += 1;
    });

    res.json({
      reviews,
      summary: {
        total,
        averageRating,
        breakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
  getLandlordReviews,
};
const PropertyView = require('../models/PropertyView');
const Property = require('../models/Property');

// @desc    Get landlord analytics — views per property for the last 7 days,
//          plus total view counts. Enquiry data is NOT included here yet
//          (needs the Conversation/Message model wired in separately).
// @route   GET /api/analytics/landlord
// @access  Private (landlord only)
const getLandlordAnalytics = async (req, res) => {
  try {
    const landlordId = req.user._id;

    const properties = await Property.find({ landlord: landlordId }).select(
      'title status location'
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // today + 6 previous days = 7 days
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Views grouped by property + day, for the last 7 days
    const viewsByDay = await PropertyView.aggregate([
      {
        $match: {
          landlord: landlordId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            property: '$property',
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    // Total lifetime views per property
    const totalViewsPerProperty = await PropertyView.aggregate([
      { $match: { landlord: landlordId } },
      { $group: { _id: '$property', count: { $sum: 1 } } },
    ]);

    const totalViews = totalViewsPerProperty.reduce(
      (sum, p) => sum + p.count,
      0
    );

    res.json({
      properties,
      viewsByDay,
      totalViewsPerProperty,
      totalViews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLandlordAnalytics };
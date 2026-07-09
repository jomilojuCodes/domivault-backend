const Property = require('../models/Property');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Get all properties (including pending)
// @route   GET /api/admin/properties
// @access  Admin only
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({})
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a property listing
// @route   PUT /api/admin/properties/:id/approve
// @access  Admin only
const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.isApproved = true;
    property.status = 'inspection_scheduled';
    await property.save();

    // Notify landlord
    await createNotification({
      recipient: property.landlord,
      type: 'listing_approved',
      title: 'Listing approved!',
      message: `Your listing "${property.title}" has been approved. An inspection will be scheduled shortly.`,
      property: property._id,
    });

    res.json({ message: 'Property approved and inspection scheduled', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark property as inspected and live
// @route   PUT /api/admin/properties/:id/inspect
// @access  Admin only
const markAsInspected = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.isInspected = true;
    property.isApproved = true;
    property.status = 'live';
    property.inspectionDate = new Date();
    await property.save();

    // Notify landlord
    await createNotification({
      recipient: property.landlord,
      type: 'listing_live',
      title: 'Your listing is now live!',
      message: `Your listing "${property.title}" has been inspected and is now live on Domivault.`,
      property: property._id,
    });

    res.json({ message: 'Property is now live on Domivault', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a property listing
// @route   PUT /api/admin/properties/:id/reject
// @access  Admin only
const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = 'rejected';
    property.isApproved = false;
    await property.save();

    // Notify landlord
    await createNotification({
      recipient: property.landlord,
      type: 'listing_rejected',
      title: 'Listing rejected',
      message: `Your listing "${property.title}" was not approved. Please review and resubmit.`,
      property: property._id,
    });

    res.json({ message: 'Property rejected', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Admin only
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = true;
    await user.save();

    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify a landlord
// @route   PUT /api/admin/users/:id/verify
// @access  Admin only
const verifyLandlord = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    // Notify landlord
    await createNotification({
      recipient: user._id,
      type: 'system',
      title: 'Account verified!',
      message: 'Your landlord account has been verified. You can now list properties on Domivault.',
    });

    res.json({ message: 'Landlord verified', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProperties,
  approveProperty,
  markAsInspected,
  rejectProperty,
  getAllUsers,
  suspendUser,
  verifyLandlord,
};
const Property = require('../models/Property');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const SavedListing = require('../models/SavedListing');
const Notification = require('../models/Notification');
const { createNotification } = require('./notificationController');

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

const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    property.isApproved = true;
    property.status = 'inspection_scheduled';
    await property.save();
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

const markAsInspected = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    property.isInspected = true;
    property.isApproved = true;
    property.status = 'live';
    property.inspectionDate = new Date();
    await property.save();
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

const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    property.status = 'rejected';
    property.isApproved = false;
    await property.save();
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

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isSuspended = true;
    await user.save();
    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyLandlord = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isVerified = true;
    user.isSuspended = false;
    await user.save();
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

const resetDevData = async (req, res) => {
  try {
    const deletedUsers = await User.deleteMany({ role: { $ne: 'admin' } });
    await Property.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await SavedListing.deleteMany({});
    res.json({
      message: 'Dev data cleared successfully. Admin accounts preserved.',
      deletedUsers: deletedUsers.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const now = new Date();
    const weeks = [];
    const labels = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = await User.countDocuments({
        createdAt: { $gte: weekStart, $lt: weekEnd },
        role: { $ne: 'admin' }
      });
      weeks.push(count);
      labels.push('Wk' + (8 - i));
    }

    const cumulative = [];
    let total = 0;
    for (let w of weeks) {
      total += w;
      cumulative.push(total);
    }

    res.json({
      weeklySignups: weeks,
      cumulativeUsers: cumulative,
      labels,
      totalUsers: await User.countDocuments({ role: { $ne: 'admin' } }),
      totalLandlords: await User.countDocuments({ role: 'landlord' }),
      totalTenants: await User.countDocuments({ role: 'tenant' }),
      liveListings: await Property.countDocuments({ status: 'live' }),
      pendingListings: await Property.countDocuments({ status: 'pending' }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {s
  getAllProperties,
  approveProperty,
  markAsInspected,
  rejectProperty,
  getAllUsers,
  suspendUser,
  verifyLandlord,
  resetDevData,
  getStats,
};
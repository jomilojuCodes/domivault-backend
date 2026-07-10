const User = require('../models/User');
const { createNotification } = require('./notificationController');

const submitNIN = async (req, res) => {
  try {
    const { nin } = req.body;
    if (!nin || nin.length !== 11) {
      return res.status(400).json({ message: 'NIN must be 11 digits' });
    }
    const user = await User.findById(req.user._id);
    user.nin = nin;
    user.verificationStatus = 'nin_submitted';
    await user.save();
    res.json({ message: 'NIN submitted successfully', nin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitCAC = async (req, res) => {
  try {
    const { cacNumber } = req.body;
    if (!cacNumber) {
      return res.status(400).json({ message: 'CAC number is required' });
    }
    const user = await User.findById(req.user._id);
    user.cacNumber = cacNumber;
    user.verificationStatus = 'cac_submitted';
    await user.save();
    res.json({ message: 'CAC submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitFaceVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.verificationStatus = 'pending_review';
    await user.save();

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: 'system',
        title: 'New landlord verification',
        message: `${user.name} has submitted verification and is awaiting review.`,
        sender: user._id,
      });
    }

    res.json({
      message: 'Face verification submitted. Your account is pending review.',
      status: 'pending_review',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'nin cacNumber selfieUrl isVerified verificationStatus faceVerified'
    );
    res.json({
      nin: user.nin ? 'Submitted' : 'Not submitted',
      cac: user.cacNumber ? 'Submitted' : 'Not submitted',
      face: user.selfieUrl ? 'Submitted' : 'Not submitted',
      isVerified: user.isVerified,
      status: user.verificationStatus || 'not_started',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitNIN,
  submitCAC,
  submitFaceVerification,
  getVerificationStatus,
};
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['tenant', 'landlord', 'admin'],
    default: 'tenant',
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  // Landlord verification
  nin: { type: String, default: '' },
  cacNumber: { type: String, default: '' },
  cacDocument: { type: String, default: '' },
  selfieUrl: { type: String, default: '' },
  faceVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: [
      'not_started',
      'nin_submitted',
      'cac_submitted',
      'pending_review',
      'verified',
      'rejected',
    ],
    default: 'not_started',
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
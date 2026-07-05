const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  location: {
    address: { type: String, required: true },
    area: { type: String, required: true },
    state: { type: String, default: 'Lagos' },
    landmarks: [String],
  },
  type: {
    type: String,
    enum: ['Apartment', 'Detached House', 'Semi-Detached', 'Terrace', 'Duplex', 'Studio'],
    required: true,
  },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  parking: { type: Number, default: 0 },
  size: { type: Number },
  furnishing: {
    type: String,
    enum: ['Unfurnished', 'Semi-furnished', 'Fully furnished'],
    default: 'Unfurnished',
  },
  amenities: [String],
  images: [String],
  documents: [String],
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isInspected: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  inspectionDate: { type: Date },
  availableFrom: { type: Date },
  cautionDeposit: { type: Number, default: 10 },
  legalFee: { type: Number, default: 15 },
  status: {
    type: String,
    enum: ['pending', 'inspection_scheduled', 'inspected', 'live', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
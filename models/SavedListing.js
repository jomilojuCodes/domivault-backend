const mongoose = require('mongoose');

const savedListingSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
}, { timestamps: true });

// Prevent duplicate saves
savedListingSchema.index({ tenant: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('SavedListing', savedListingSchema);
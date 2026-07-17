const mongoose = require('mongoose');

const propertyViewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for fast per-landlord, per-date-range aggregation queries
propertyViewSchema.index({ landlord: 1, createdAt: -1 });
propertyViewSchema.index({ property: 1, createdAt: -1 });

module.exports = mongoose.model('PropertyView', propertyViewSchema);
const Property = require("../models/Property");

// Create a property
const createProperty = async (req, res) => {
  try {
    const property = await Property.create({
      ...req.body,
      landlord: req.user.id,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all properties
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate(
      "landlord",
      "fullName email"
    );

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
};
const express = require("express");
const router = express.Router();

const {
  createProperty,
  getProperties,
} = require("../controllers/propertyController");

const authMiddleware = require("../middleware/authMiddleware");

// Get all properties (Public)
router.get("/", getProperties);

// Create a property (Logged-in users only)
router.post("/", authMiddleware, createProperty);

module.exports = router;
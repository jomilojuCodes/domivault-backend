const User = require("../models/User");
const bcrypt = require("bcrypt");
const validator = require("validator");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check for empty fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields",
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
};
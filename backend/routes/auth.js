const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User model
const User = require("../models/User");

// @route   POST /api/auth/register
// @desc    Register user
router.post("/register", async (req, res) => {
  const { 
    name, 
    email, 
    password,
    age,
    gender,
    height_cm,
    weight_kg,
    activity_level,
    goal,
    target_weight,
    health_conditions,
    diet_preferences,
    daily_calorie_target,
    carbs_percentage,
    protein_percentage,
    fat_percentage
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create user object with all fields
    const userData = {
      name,
      email,
      password,
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level,
      goal,
      target_weight,
      health_conditions: health_conditions || [],
      diet_preferences: diet_preferences || [],
      daily_calorie_target,
      carbs_percentage,
      protein_percentage,
      fat_percentage
    };

    // Remove undefined fields
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });

    user = new User(userData);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;

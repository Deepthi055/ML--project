const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  age: Number,
  gender: { type: String, enum: ["male", "female", "non-binary", "prefer-not-to-say", "other"] },
  height_cm: Number,
  weight_kg: Number,
  activity_level: { type: String, enum: ["sedentary", "light", "moderate", "active"] },
  goal: { type: String, enum: ["weight_loss", "weight_gain", "maintain"] },
  target_weight: Number,
  health_conditions: { type: [String], default: [] },  // optional
  diet_preferences: { type: [String], default: [] },   // optional
  daily_calorie_target: Number,   // optional
  carbs_percentage: Number,
  protein_percentage: Number,
  fat_percentage: Number
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

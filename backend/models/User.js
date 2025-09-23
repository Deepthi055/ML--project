const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  age: Number,
  gender: { type: String, enum: ["male", "female", "other"] },
  height_cm: Number,
  weight_kg: Number,
  activity_level: { type: String, enum: ["sedentary", "light", "moderate", "active"] },
  goal: { type: String, enum: ["weight_loss", "weight_gain", "maintain"] },
  health_conditions: [String],  // optional
  diet_preferences: [String],   // optional
  daily_calorie_target: Number   // optional
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

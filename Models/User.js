const mongoose = require('mongoose');

// Phone number validation regex (simple example, can be adjusted)
const phoneRegex = /^[0-9]{10}$/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes extra spaces
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: phoneRegex, // Ensuring the phone follows the 10-digit format
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  coins: {
    type: Number,
    default: 0,
    min: 0, // Coins cannot be negative
  },
  profileImage: {
    type: String,  // Stores the URL to the profile image
    default: null, // Default profile image can be null initially
  },
});

// Optional: Pre-save hook to check OTP expiration
userSchema.pre('save', function (next) {
  if (this.otpExpires && this.otpExpires < Date.now()) {
    this.otp = null; // Clear OTP if expired
  }
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);


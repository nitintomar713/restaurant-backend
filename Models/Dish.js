const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'starter', 
      'main', 
      'dessert', 
      'beverage', 
      'special', 
      'other',
      'indian', 
      'south indian', 
      'breads', 
      'chinese', 
      'italian', // Add more custom categories as needed
    ],
  },
  tags: {
    type: [String],
    default: [],
  },
  imageUrl: {
    type: String, // Will store the URL of the uploaded image
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Use mongoose.models to check if the model is already defined
module.exports = mongoose.models.Dish || mongoose.model('Dish', dishSchema);

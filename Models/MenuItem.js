const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  priceHalf: { type: Number },
  priceFull: { type: Number },
  image: { type: String }, // stores the filename or image URL
  isAvailable: { type: Boolean, default: true },
  showInMenu: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

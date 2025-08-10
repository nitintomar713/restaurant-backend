const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  priceHalf: Number,
  priceFull: Number,
  image: String, // Cloudinary URL
  public_id: String, // Cloudinary public ID for delete
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  isAvailable: { type: Boolean, default: true },
  showInMenu: { type: Boolean, default: true },
});

module.exports = mongoose.model("MenuItem", menuItemSchema);

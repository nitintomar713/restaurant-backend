const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      unique: true,
      trim: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    products: [
      {
        name: String,
        quantity: Number
      }
    ]
  },
  { timestamps: true }
);

const Analytics = mongoose.model('Analytics', analyticsSchema);
module.exports = Analytics;

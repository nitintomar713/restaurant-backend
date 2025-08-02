const express = require('express');
const router = express.Router();
const Analytics = require('../Models/Analytics');

// ✅ GET daily analytics data (totalOrders, totalRevenue)
router.get('/update', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const analytics = await Analytics.findOne({ date: today });

    if (!analytics) {
      return res.status(404).json({ message: 'No analytics data found for today.' });
    }

    res.json(analytics);
  } catch (error) {
    console.error("❌ Error fetching analytics data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

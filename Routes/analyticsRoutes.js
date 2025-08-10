const express = require('express');
const router = express.Router();
const Analytics = require('../Models/Analytics');

// ✅ GET today's analytics data
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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

// 🛠️ POST today's analytics data (create or update)
router.post('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { totalOrders, totalRevenue } = req.body;

    if (totalOrders == null || totalRevenue == null) {
      return res.status(400).json({ message: 'totalOrders and totalRevenue are required.' });
    }

    const updatedAnalytics = await Analytics.findOneAndUpdate(
      { date: today },
      { $set: { totalOrders, totalRevenue } },
      { upsert: true, new: true }
    );

    res.json(updatedAnalytics);
  } catch (error) {
    console.error("❌ Error updating analytics data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

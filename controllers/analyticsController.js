const Analytics = require('../Models/Analytics');

// 📊 GET analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const analyticsData = await Analytics.find().sort({ date: -1 });
    res.status(200).json(analyticsData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ POST or Update analytics data for a date
exports.updateAnalytics = async (req, res) => {
  const { date, orderAmount } = req.body;

  if (!date || !orderAmount) {
    return res.status(400).json({ message: 'Date and orderAmount are required.' });
  }

  try {
    const updated = await Analytics.findOneAndUpdate(
      { date },
      {
        $inc: {
          totalOrders: 1,
          totalRevenue: orderAmount,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

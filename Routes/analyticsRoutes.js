const express = require('express');
const router = express.Router();
const Analytics = require('../Models/Analytics');
const Order = require('../Models/Order');

// ✅ Get today's analytics with products sold
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 📊 Get today's analytics summary
    const analytics = await Analytics.findOne({ date: today });
    if (!analytics) {
      return res.status(404).json({ message: 'No analytics data for today.' });
    }

    // 🛒 Get today's orders
    const todayOrders = await Order.find({
      createdAt: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1))
      }
    });

    // 🍔 Aggregate products
    const productMap = {};
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.name} (${item.size})`;
        if (!productMap[key]) {
          productMap[key] = 0;
        }
        productMap[key] += item.quantity;
      });
    });

    const productsSold = Object.entries(productMap).map(([name, quantity]) => ({
      name,
      quantity
    }));

    // 📦 Return analytics + product list
    res.json({
      ...analytics.toObject(),
      products: productsSold
    });

  } catch (err) {
    console.error('❌ Error fetching analytics:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;

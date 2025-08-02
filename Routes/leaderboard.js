const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');

// Top customers by reviews, likes, coins
router.get('/', async (req, res) => {
  try {
    const topByReviews = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$userId', reviews: { $sum: 1 } } },
      { $sort: { reviews: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          phone: '$user.phone',
          reviews: 1,
        },
      },
    ]);

    const topByLikes = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$userId', likes: { $sum: '$likes' } } },
      { $sort: { likes: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          phone: '$user.phone',
          likes: 1,
        },
      },
    ]);

    const topByCoins = await User.find().sort({ coins: -1 }).limit(10).select('phone coins');

    res.json({
      topByReviews,
      topByLikes,
      topByCoins,
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Leaderboard fetch failed', error: err.message });
  }
});

module.exports = router;

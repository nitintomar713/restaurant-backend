const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');

// POST /api/suggestions
router.post('/', async (req, res) => {
  const { mood, weather, occasion, voiceText } = req.body;

  try {
    let tags = [];

    // Voice recognition logic
    if (voiceText) {
      const text = voiceText.toLowerCase();
      if (text.includes('spicy')) tags.push('spicy');
      if (text.includes('lunch')) tags.push('lunch');
      if (text.includes('rain') || text.includes('monsoon')) tags.push('rainy');
      if (text.includes('cold')) tags.push('winter');
      if (text.includes('party')) tags.push('party');
    }

    // Add mood, weather, occasion if present
    if (mood) tags.push(mood.toLowerCase());
    if (weather) tags.push(weather.toLowerCase());
    if (occasion) tags.push(occasion.toLowerCase());

    console.log('🔍 Searching for tags:', tags);

    const dishes = await Dish.find({ tags: { $in: tags } });

    res.json({
      message: `✅ Suggestions for: ${tags.join(', ')}`,
      results: dishes,
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Suggestion error', error: err.message });
  }
});

module.exports = router;

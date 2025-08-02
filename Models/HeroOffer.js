const mongoose = require('mongoose');

const HeroOfferSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  image: { type: String, required: true },
  display: { type: Boolean, default: false }
});

module.exports = mongoose.model('HeroOffer', HeroOfferSchema);

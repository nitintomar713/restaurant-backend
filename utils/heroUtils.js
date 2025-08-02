const HeroOffer = require('../Models/HeroOffer.js');
const path = require('path');

exports.createOffer = async (req, res) => {
  try {
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/static/${req.file.filename}` : '';
    const newOffer = new HeroOffer({
      heading: req.body.heading,
      image: imageUrl,
    });
    await newOffer.save();
    res.status(201).json(newOffer);
  } catch (err) {
    res.status(500).json({ message: 'Error creating offer', error: err.message });
  }
};

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await HeroOffer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching offers', error: err.message });
  }
};

exports.getActiveOffer = async (req, res) => {
  try {
    const offer = await HeroOffer.findOne({ isActive: true });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active offer', error: err.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    await HeroOffer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting offer', error: err.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const updatedFields = { heading: req.body.heading };
    if (req.file) {
      updatedFields.image = `${req.protocol}://${req.get('host')}/static/${req.file.filename}`;
    }
    const updatedOffer = await HeroOffer.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    res.json(updatedOffer);
  } catch (err) {
    res.status(500).json({ message: 'Error updating offer', error: err.message });
  }
};

exports.setActiveOffer = async (req, res) => {
  try {
    // First deactivate all
    await HeroOffer.updateMany({}, { isActive: false });
    // Then activate selected one
    const updated = await HeroOffer.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    res.json({ message: 'Offer activated', offer: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error activating offer', error: err.message });
  }
};

const express = require('express');
const multer = require('multer');
const HeroOffer = require('../Models/HeroOffer');
const router = express.Router();
const path = require('path');

// Multer config for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

// GET all offers
router.get('/', async (req, res) => {
  try {
    const offers = await HeroOffer.find().sort({ _id: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// POST new offer
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { heading } = req.body;
    const newOffer = new HeroOffer({
      heading,
      image: req.file ? req.file.filename : ''
    });
    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add offer' });
  }
});

// PUT update offer
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { heading } = req.body;
    const updateData = { heading };
    if (req.file) updateData.image = req.file.filename;

    const offer = await HeroOffer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// DELETE an offer
router.delete('/:id', async (req, res) => {
  try {
    await HeroOffer.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// PATCH to set which offer to display
router.patch('/set-display/:id', async (req, res) => {
  try {
    await HeroOffer.updateMany({}, { display: false });
    const updated = await HeroOffer.findByIdAndUpdate(req.params.id, { display: true }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set display offer' });
  }
});

router.get('/displayed', async (req, res) => {
  const displayed = await HeroOffer.findOne({ display: true });
  if (!displayed) return res.status(404).json({ message: 'No offer is marked for display' });
  res.json(displayed);
});

module.exports = router;

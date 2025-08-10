const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const HeroOffer = require('../Models/HeroOffer');
const router = express.Router();

// Cloudinary setup
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hero_offers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});
const upload = multer({ storage });

// 💥 Helper: Delete local file if exists
function deleteLocalFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Failed to delete local file:', err);
    else console.log('Deleted local file:', filePath);
  });
}

// ✅ GET all offers
router.get('/', async (req, res) => {
  try {
    const offers = await HeroOffer.find().sort({ _id: -1 });
    res.status(200).json(offers);
  } catch (error) {
    console.error('💥 Error fetching offers:', error.message);
    res.status(500).json({ error: 'Failed to fetch offers', message: error.message });
  }
});

// ✅ GET currently displayed offer
router.get('/displayed', async (req, res) => {
  try {
    const displayed = await HeroOffer.findOne({ display: true });
    if (!displayed) return res.status(404).json({ message: 'No offer is marked for display' });
    res.status(200).json(displayed);
  } catch (error) {
    console.error('💥 Error fetching displayed offer:', error.message);
    res.status(500).json({ error: 'Failed to fetch displayed offer', message: error.message });
  }
});

// ✅ POST new offer
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { heading } = req.body;
    if (!heading) {
      return res.status(400).json({ error: 'Heading is required' });
    }

    const newOffer = new HeroOffer({
      heading,
      image: req.file?.path || '',
      publicId: req.file?.public_id || '',
    });
    await newOffer.save();

    // Example cleanup if you save locally first
    if (req.file) deleteLocalFile(req.file.path);

    res.status(201).json(newOffer);
  } catch (error) {
    console.error('💥 Error adding offer:', error.message);
    res.status(500).json({ error: 'Failed to add offer', message: error.message });
  }
});

// ✅ DELETE an offer (with Cloudinary cleanup)
router.delete('/:id', async (req, res) => {
  try {
    const offer = await HeroOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Delete from Cloudinary if publicId exists
    if (offer.publicId) {
      try {
        await cloudinary.uploader.destroy(offer.publicId);
        console.log(`🗑️ Deleted Cloudinary media: ${offer.publicId}`);
      } catch (err) {
        console.error('⚠️ Failed to delete Cloudinary media:', err.message);
      }
    }

    await HeroOffer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Offer deleted', offer });
  } catch (error) {
    console.error('💥 Error deleting offer:', error.message);
    res.status(500).json({ error: 'Failed to delete offer', message: error.message });
  }
});

// ✅ PUT update offer (with Cloudinary cleanup on new upload)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const offer = await HeroOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const { heading } = req.body;
    const updateData = { heading };

    // If a new image is uploaded
    if (req.file) {
      // Clean previous image from Cloudinary
      if (offer.publicId) {
        try {
          await cloudinary.uploader.destroy(offer.publicId);
          console.log(`🗑️ Cleared old Cloudinary media: ${offer.publicId}`);
        } catch (err) {
          console.error('⚠️ Failed to delete Cloudinary media:', err.message);
        }
      }
      updateData.image = req.file.path;
      updateData.publicId = req.file.public_id;
      
    }

    const updated = await HeroOffer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ message: 'Offer updated', offer: updated });
  } catch (error) {
    console.error('💥 Error updating offer:', error.message);
    res.status(500).json({ error: 'Failed to update offer', message: error.message });
  }
});

// ✅ PATCH set which offer to display
router.patch('/set-display/:id', async (req, res) => {
  try {
    const offer = await HeroOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    await HeroOffer.updateMany({}, { display: false });
    const updated = await HeroOffer.findByIdAndUpdate(req.params.id, { display: true }, { new: true });
    res.status(200).json({ message: 'Display offer set', offer: updated });
  } catch (error) {
    console.error('💥 Error setting display offer:', error.message);
    res.status(500).json({ error: 'Failed to set display offer', message: error.message });
  }
});

module.exports = router;

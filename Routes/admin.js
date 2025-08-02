const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Dish = require('../models/Dish');
const Review = require('../models/Review');
const User = require('../models/User');
const router = express.Router();

// Ensure that the 'uploads' folder exists
const uploadDirectory = 'uploads/';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);  // Create uploads directory if it doesn't exist
}

// Setup multer storage engine for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Define upload folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique file names
  }
});

// File filter to accept only image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG are allowed'), false); // Reject file
  }
};

// Initialize multer for image upload
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter
});

// 🔸 Add Dish with Image
router.post('/dishes', upload.single('image'), async (req, res) => {
  try {
    // Extract data from request
    const { name, description, price, category, tags } = req.body;
    let imageUrl = '';

    // If an image was uploaded, store its path
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // Image URL will be accessible at `/uploads/<filename>`
    }

    // Create a new dish
    const newDish = new Dish({
      name,
      description,
      price,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      imageUrl
    });

    await newDish.save();
    res.status(201).json({ message: '✅ Dish added', dish: newDish });
  } catch (err) {
    console.error('Error adding dish:', err);  // Log error for better debugging
    res.status(500).json({ message: '❌ Failed to add dish', error: err.message });
  }
});

// 🔸 Delete Dish
router.delete('/dishes/:id', async (req, res) => {
  try {
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: '❌ Dish not found' });
    }
    res.json({ message: '✅ Dish deleted' });
  } catch (err) {
    console.error('Error deleting dish:', err);  // Log error for better debugging
    res.status(500).json({ message: '❌ Failed to delete dish', error: err.message });
  }
});

// 🔸 Get All Users (without OTP and OTP expiry)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-otp -otpExpires');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);  // Log error for better debugging
    res.status(500).json({ message: '❌ Failed to fetch users', error: err.message });
  }
});

// 🔸 Assign Coins to User based on Review
router.patch('/reviews/:id/assign-coins', async (req, res) => {
  const { coins } = req.body;
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: '❌ Review not found' });

    await User.findByIdAndUpdate(review.userId, { $inc: { coins: coins || 10 } });
    res.json({ message: `✅ ${coins || 10} coins assigned to user.` });
  } catch (err) {
    console.error('Error assigning coins:', err);  // Log error for better debugging
    res.status(500).json({ message: '❌ Failed to assign coins', error: err.message });
  }
});

// 🔸 Get Top 3 Reviews by Likes
router.get('/reviews/top3', async (req, res) => {
  try {
    const topReviews = await Review.find({ status: 'approved' }).sort({ likes: -1 }).limit(3);
    res.json(topReviews);
  } catch (err) {
    console.error('Error fetching top reviews:', err);  // Log error for better debugging
    res.status(500).json({ message: '❌ Failed to fetch top reviews', error: err.message });
  }
});

module.exports = router;

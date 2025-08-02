const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Review = require("../Models/Review");
const Customer = require("../Models/Customer");

// Setup Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/reviews/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ========== POST Review ========== */
router.post("/submit", upload.single("media"), async (req, res) => {
  try {
    const { customerName, text } = req.body;

    if (!customerName || !text) {
      return res.status(400).json({ error: "Customer name and review text are required." });
    }

    const customer = await Customer.findOne({ name: customerName });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const newReview = new Review({
      customer: customer._id,
      customerName: customer.name,
      text,
      media: req.file ? `uploads/reviews/${req.file.filename}` : null,
      mediaType: req.file ? req.file.mimetype : null,
    });

    await newReview.save();
    res.status(201).json({ message: "Review submitted for approval." });
  } catch (err) {
    console.error("💥 Error submitting review:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/* ========== GET All Reviews (Admin) ========== */
/* ========== GET All Reviews (Admin) ========== */
router.get("/all", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email picture") // <-- include picture
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching all reviews:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


/* ========== PATCH Like ========== */
router.patch("/:id/like", async (req, res) => {
  try {
    const { customerId } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (!review.likedBy.includes(customerId)) {
      review.likes += 1;
      review.likedBy.push(customerId);
      await review.save();
    }

    res.status(200).json({ message: "Liked" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ========== PATCH Approve ========== */
router.patch("/:id/approve", async (req, res) => {
  try {
    const { status } = req.body;
    await Review.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Review ${status}` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ========== GET Top Liked ========== */
router.get("/top-liked", async (req, res) => {
  try {
    const reviews = await Review.find({ status: "approved" })
      .sort({ likes: -1 })
      .limit(3);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ========== DELETE Review ========== */
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // Remove associated media file if exists
    if (review.media) {
      const mediaPath = path.join(__dirname, "..", review.media);
      fs.unlink(mediaPath, (err) => {
        if (err) console.warn("⚠️ Failed to delete media file:", err.message);
      });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted successfully." });
  } catch (err) {
    console.error("Error deleting review:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

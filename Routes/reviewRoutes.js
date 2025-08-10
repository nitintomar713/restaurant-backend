const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Review = require("../Models/Review");
const Customer = require("../Models/Customer");
const { cloudinary } = require("../utils/cloudinary");
const { getUploadMiddleware } = require("../utils/cloudinary");
const upload = getUploadMiddleware("reviews"); // Folder: 'reviews' on Cloudinary

// Helper to delete local files (reuse the same as in menuController)
function deleteLocalFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Failed to delete local file:', err);
    else console.log('Deleted local file:', filePath);
  });
}

/* ========== POST Review ========== */
router.post("/submit", upload.single("media"), async (req, res) => {
  try {
    const { customerName, text } = req.body;

    if (!customerName || !text) {
      return res.status(400).json({ error: "Customer name and review text are required." });
    }

    const customer = await Customer.findOne({ name: customerName });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    let mediaUrl = null;
    let publicId = null;
    let mediaType = null;

    // Upload to Cloudinary if a file is present
    if (req.file) {
      console.log("Uploading review media to Cloudinary:", req.file.path);
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "reviews",
        resource_type: "auto", // Detects image/video automatically
      });
      deleteLocalFile(req.file.path); // Clean up

      mediaUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
      mediaType = uploadResult.resource_type;
    }

    const newReview = new Review({
      customer: customer._id,
      customerName: customer.name,
      text,
      media: mediaUrl,      // Cloudinary URL
      mediaType,            // 'image' or 'video'
      publicId,             // For future deletions/updates
    });

    await newReview.save();
    console.log(`✅ Review submitted: ${newReview._id}`);
    res.status(201).json({ message: "Review submitted for approval.", review: newReview });

  } catch (err) {
    console.error("💥 Error submitting review:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});


router.get("/all", async (req, res) => {
  try {
    console.log("📥 Fetching all reviews...");
    const reviews = await Review.find()
      .populate("customer", "name email picture")
      .sort({ createdAt: -1 });

    console.log(`📊 Retrieved ${reviews.length} reviews`);
    res.status(200).json(reviews);

  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});


/* ========== PATCH Like ========== */
router.patch("/:id/like", async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: "Customer ID is required" });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (!review.likedBy.includes(customerId)) {
      review.likes += 1;
      review.likedBy.push(customerId);
      await review.save();
      console.log(`👍 Review ${review._id} liked by ${customerId}`);
    }

    res.status(200).json({ message: "Liked", review });

  } catch (err) {
    console.error("Error liking review:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});


/* ========== PATCH Approve ========== */
router.patch("/:id/approve", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });

    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Review not found" });

    console.log(`✅ Review ${updated._id} status updated to ${status}`);
    res.status(200).json({ message: `Review ${status}`, review: updated });

  } catch (err) {
    console.error("Error updating review status:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});


/* ========== GET Top Liked ========== */
router.get("/top-liked", async (req, res) => {
  try {
    console.log("🔝 Fetching top-liked reviews...");
    const reviews = await Review.find({ status: "approved" })
      .sort({ likes: -1 })
      .limit(3);

    res.status(200).json(reviews);

  } catch (err) {
    console.error("Error fetching top-liked reviews:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});


/* ========== DELETE Review ========== */
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // Delete media from Cloudinary if public_id exists
    if (review.publicId) {
      try {
        await cloudinary.uploader.destroy(review.publicId);
        console.log(`🗑️ Deleted Cloudinary media: ${review.publicId}`);
      } catch (err) {
        console.error("⚠️ Failed to delete Cloudinary media:", err.message);
      }
    }

    await Review.findByIdAndDelete(req.params.id);
    console.log(`🗑️ Review deleted: ${review._id}`);
    res.status(200).json({ message: "Review deleted", review });

  } catch (err) {
    console.error("Error deleting review:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});


module.exports = router;

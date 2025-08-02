const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  customerName: String,
  text: {
    type: String,
    required: true,
    trim: true,
  },
  media: String, // image or video filename
  mediaType: String,
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }],
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);

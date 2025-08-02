const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [
    {
      name: { type: String, required: true }, // Dish name
      quantity: { type: Number, required: true, default: 1 },
      size: { type: String, enum: ['half', 'full'], required: true }, // 'half' or 'full'
      price: { type: Number, required: true }, // Price for this item (based on quantity & size)
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

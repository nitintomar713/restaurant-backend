const express = require('express');
const router = express.Router();
const Customer = require('../Models/Customer');


// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save or update customer
router.post('/', async (req, res) => {
  const { name, email, picture, phone } = req.body;

  try {
    let customer = await Customer.findOne({ email });

    if (customer) {
      // Update phone if needed
      customer.phone = phone;
      await customer.save();
      return res.status(200).json({ message: 'Customer updated', customer });
    }

    // Create new
    customer = new Customer({ name, email, picture, phone });
    await customer.save();
    res.status(201).json({ message: 'Customer created', customer });

  } catch (err) {
    console.error('Error saving customer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

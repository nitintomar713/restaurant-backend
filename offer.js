// routes/offer.js

const express = require('express');
const router = express.Router();
const Customer = require('../Models/Customer');
const nodemailer = require('nodemailer');

// POST /api/offer/send
router.post('/send', async (req, res) => {
  try {
    const customers = await Customer.find();
    if (!customers || customers.length === 0) {
      return res.status(404).json({ message: 'No customers found.' });
    }

    // Configure your SMTP transporter (use your Gmail or service credentials)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
    });

    // Email content
    const subject = req.body.subject || "🔥 Special Offer Just for You!";
    const message = req.body.message || "We have an amazing deal waiting for you. Check it out now!";
    
    for (const customer of customers) {
      await transporter.sendMail({
        from: `"V.S. Fast Food" <${process.env.SMTP_EMAIL}>`,
        to: customer.email,
        subject: subject,
        html: `
          <h2>Hello ${customer.name},</h2>
          <p>${message}</p>
          <p><strong>Don't miss out!</strong></p>
        `,
      });
    }

    res.status(200).json({ message: `Offer sent to ${customers.length} customers.` });

  } catch (error) {
    console.error("❌ Error sending offer emails:", error);
    res.status(500).json({ message: 'Server error while sending offers.' });
  }
});

module.exports = router;

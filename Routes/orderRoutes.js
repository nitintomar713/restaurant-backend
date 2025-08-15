const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const Customer = require('../Models/Customer');
const Analytics = require('../Models/Analytics');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const https = require('https');

// 📤 Send PDF, update Analytics, and delete Order
router.post('/:orderId/send-pdf', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('customer');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      // ✉️ Send Email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"V.S. Fast Food" <${process.env.EMAIL_USER}>`,
        to: order.customer.email,
        subject: `Your Bill - V.S. Fast Food Order #${order._id}`,
        text: 'Thank you for dining with us! Please find your invoice attached.',
        attachments: [
          {
            filename: `vsfastfood_invoice_${order._id}.pdf`,
            content: pdfData,
          },
        ],
      });

      // 📊 Update analytics
      const today = new Date().toISOString().split('T')[0];
      await Analytics.findOneAndUpdate(
        { date: today },
        {
          $inc: {
            totalOrders: 1,
            totalRevenue: order.totalAmount,
          },
          $push: {
            products: { $each: order.items.map(item => ({ name: item.name, quantity: item.quantity })) }
          }
        },
        { upsert: true, new: true }
      );

      // ❌ Delete order
      await Order.findByIdAndDelete(order._id);

      res.status(200).json({ message: 'PDF sent, analytics updated with products, and order deleted.' });
    });

    // 🖨️ PDF content
    const logoUrl = 'https://i.ibb.co/sp2HJdmc/VSFF-Logo-min.png';
    https.get(logoUrl, (imgRes) => {
      const chunks = [];
      imgRes.on('data', chunk => chunks.push(chunk));
      imgRes.on('end', () => {
        const logo = Buffer.concat(chunks);

        doc.image(logo, 50, 40, { width: 80 });
        doc.fontSize(22).text('V.S. Fast Food', 150, 50, { align: 'left' });

        doc.moveDown(2);
        doc.fontSize(14).text(`Invoice #: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
        doc.text(`Customer: ${order.customer.name}`);
        doc.text(`Phone: ${order.customer.phone}`);
        doc.text(`Email: ${order.customer.email}`);
        doc.moveDown();

        doc.fontSize(16).text('Order Details', { underline: true });
        doc.moveDown(0.5);

        order.items.forEach((item, i) => {
          doc.fontSize(12).text(
            `${i + 1}. ${item.quantity} x ${item.size} ${item.name} - ₹${(item.price).toFixed(2)}`
          );
        });

        doc.moveDown();
        doc.fontSize(14).text(`Total Amount: ₹${(order.totalAmount).toFixed(2)}`, {
          align: 'right',
          underline: true,
        });

        doc.end();
      });
    }).on('error', err => {
      console.error('Failed to load logo image:', err.message);
      doc.fontSize(22).text('V.S. Fast Food', { align: 'center' });
      doc.text('Logo could not be loaded');
      doc.end();
    });

  } catch (err) {
    console.error('❌ Error in /send-pdf:', err.message);
    res.status(500).json({ message: 'Failed to generate/send PDF.' });
  }
});

// ✅ Create new order
router.post('/', async (req, res) => {
  try {
    const { customerEmail, items, totalAmount, note } = req.body;

    if (!customerEmail || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      return res.status(400).json({ error: 'Missing or invalid order fields' });
    }

    const customer = await Customer.findOne({ email: customerEmail });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found. Please register first.' });
    }

    const newOrder = new Order({
      customer: customer._id,
      items,
      totalAmount,
      note: note || '',
    });

    await newOrder.save();

    // 📊 Update analytics
    const today = new Date().toISOString().split('T')[0];
    await Analytics.findOneAndUpdate(
      { date: today },
      {
        $inc: {
          totalOrders: 1,
          totalRevenue: totalAmount,
        },
        $push: {
          products: { $each: items.map(item => ({ name: item.name, quantity: item.quantity })) }
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: '✅ Order created successfully & analytics updated with products',
      order: newOrder,
    });
  } catch (err) {
    console.error('❌ Error creating order:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;

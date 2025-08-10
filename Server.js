const dotenv = require('dotenv');
dotenv.config()
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('💥 Unhandled Rejection:', reason);
// });

// process.on('uncaughtException', (err) => {
//   console.error('💥 Uncaught Exception:', err);
// });

const cloudinary = require('cloudinary').v2;

// 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// require('dotenv').config();
connectDB();

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001','https://vsfastfood.netlify.app','https://vsfastfoodadmin.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Logging HTTP requests
app.use(morgan('dev'));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Parsers BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware (non-error)
app.use((req, res, next) => {
  // console.log(`➡️ Incoming request: ${req.method} ${req.url}`);
  next();
});

// API routes
const menuRoutes = require('./Routes/menuRoutes');
const reviewRoutes = require('./Routes/reviewRoutes');
const analyticsRoutes = require('./Routes/analyticsRoutes');
const heroOfferRoutes = require('./Routes/heroRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const { sendOtp, verifyOtp } = require("./controllers/otpController");
const customerRoutes = require('./Routes/customers');
const offerRoutes = require('./Routes/offer');
const MenuItem = require('./Models/MenuItem'); // adjust path if needed





app.use('/api/menu', menuRoutes);
app.use('/api/offer', offerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hero-offers', heroOfferRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

app.post("/api/auth/send-otp", sendOtp);
app.post("/api/auth/verify-otp", verifyOtp);

// Test root route
app.get('/', (req, res) => {
  // console.log("⚡ Root endpoint called");
  res.send('🚀 API is running...');
});

// Catch unhandled routes (404)
app.use((req, res) => {
  // console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler - LAST middleware
app.use((err, req, res, next) => {
  // console.error("❌ Server error caught:");
  // console.error(err.stack);
  res.status(500).json({ message: '❌ Something went wrong on the server.' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

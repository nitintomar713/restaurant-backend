const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS setup
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:3001','https://vsfastfood.netlify.app','https://vsfastfoodadmin.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Serve uploaded images correctly
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Logger
app.use(morgan('dev'));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});

// ✅ Routes
const reviewRoutes = require('./Routes/reviewRoutes');
const analyticsRoutes = require('./Routes/analyticsRoutes');
const heroOfferRoutes = require('./Routes/heroRoutes'); // ✅ FIXED
const menuRoutes = require('./Routes/menuRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const { sendOtp, verifyOtp } = require("./controllers/otpController");
// ✅ Import customer route
const customerRoutes = require('./Routes/customers');
const offerRoutes = require('./Routes/offer');

// ✅ Mount route


// ✅ Mount Routes
app.use('/api/offer', offerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hero-offers', heroOfferRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.post("/api/auth/send-otp", sendOtp);

// Verify OTP
app.post("/api/auth/verify-otp", verifyOtp);


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '❌ Something went wrong on the server.' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

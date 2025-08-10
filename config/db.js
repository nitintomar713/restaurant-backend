// config/db.js
const mongoose = require('mongoose');
mongoose.set("debug", true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Mongo Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

// /utils/sendWhatsAppOTP.js
const axios = require('axios');

const sendWhatsAppOTP = async (phone, otp) => {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  const message = `Your OTP for Restaurant2030 is: ${otp}`;

  try {
    await axios.get('https://api.ultramsg.com/instance124413/', {
      params: {
        token,
        to: '91' + phone, // assuming Indian number
        body: message,
      },
    });
  } catch (err) {
    console.error('❌ WhatsApp OTP Error:', err.message);
    throw err;
  }
};

module.exports = sendWhatsAppOTP;

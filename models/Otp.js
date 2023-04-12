const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phoneNumber: String,
    otp: String,
  } ,{ timestamps: true });
  
  const OTP = mongoose.model('OTP', otpSchema);
  module.exports = OTP;
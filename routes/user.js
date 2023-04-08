const router = require('express').Router();
let User = require('../models/User');
const multer = require('multer');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const config =  require('config');
const accountSidConfig = config.get('twilio.twilioConfig.accountSid');
const authTokenConfig = config.get('twilio.twilioConfig.authToken');
const twilioPhoneNumberConfig = config.get('twilio.twilioConfig.twilioPhoneNumber');
// Twilio credentials
const accountSid = accountSidConfig; // Replace with your Twilio account SID
const authToken = authTokenConfig; // Replace with your Twilio auth token
const twilioPhoneNumber = twilioPhoneNumberConfig; // Replace with your Twilio phone number

const client = twilio(accountSid, authToken);

// Function to send OTP via SMS
function sendOtpToPhoneNumber(phoneNumber, otp) {
  const message = `Your OTP is: ${otp}`; // Message to send

  // Send SMS using Twilio
  client.messages.create({
    body: message,
    from: twilioPhoneNumber,
    to: phoneNumber
  })
  .then(message => console.log(`OTP sent to ${phoneNumber}: ${message.sid}`))
  .catch(error => console.error(`Failed to send OTP to ${phoneNumber}: ${error.message}`));
}

router.post('/otp', (req, res) => {
  // Generate OTP
  const otp = otpGenerator.generate(4, { digits: true, alphabets: false, specialChars: false,lowerCaseAlphabets: false,upperCaseAlphabets:false });

  // Send OTP to user's phone number via SMS
  const phoneNumber = req.body.phoneNumber; // Get phone number from request body
  sendOtpToPhoneNumber(phoneNumber, otp);

  res.status(200).json({ message: 'OTP sent successfully!' });
});


const validateLoginUserInput = require("../validation/login_user");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
  });
  var upload = multer({ storage: storage });


  router.post('/login', async (req, res) => {

      // Form validation
  const { errors, isValid } = validateLoginUserInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(500).json(errors);
  }

    const { identifiant, password } = req.body;
  

    const user = await User.findOne({ identifiant });
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid identifiant or password' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
  
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid identifiant or password' });
    }

    isFirstConnect = user.firstConnect;
    if (isFirstConnect) {
      return res.json({ user });
    }else
    token = user.generateToken();
    res.json({ user,token });
  });

  router.post('/signup', async (req, res) => {
    try {
      const { userName, identifiant, password, phoneNumber, image } = req.body;
  
      // Check if the identifiant already exists
      const existingUser = await User.findOne({ identifiant });
      if (existingUser) {
        return res.status(400).json({ message: 'Identifiant already exists' });
      }
  
      // Create a new user
      const user = new User({ userName, identifiant, password, phoneNumber, image });
      await user.save();
  
      // Generate token
      const token = user.generateToken();
  
      // Return the new user and token
      res.status(201).json({ user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/updatePassword/:id', async (req, res) => {
    try {

    const { oldPassword, newPassword} = req.body;

    const user = await User.findById(req.params.id);
    
    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid  password' });
    }

    user.password = newPassword;
    user.firstConnect = false;
    await user.save();

    const token = user.generateToken();
    res.json({ user,token });


  }catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;
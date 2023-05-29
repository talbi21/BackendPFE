const router = require('express').Router();
let User = require('../models/User');
let Otp = require('../models/Otp');
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});
var upload = multer({ storage: storage });

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



router.post('/sendOtp', async (req, res) => {
  const {phoneNumber} = req.body;

  const user = await User.findOne({ phoneNumber });
  
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }else{
      const otp = otpGenerator.generate(4, { digits: true, alphabets: false, specialChars: false,lowerCaseAlphabets: false,upperCaseAlphabets:false });
  
      const otps = new Otp({ phoneNumber,otp });
          await otps.save();
          
    
      // Send OTP to user's phone number via SMS
      sendOtpToPhoneNumber(phoneNumber, otp);
    
      res.status(200).json({ message: 'OTP sent successfully!'});
    }
  // Generate OTP
 
});

router.post('/VerifOtp', async (req, res) => {
  const {phoneNumber,otp} = req.body;
console.log(req.body);
  try {
    let otpDoc;

    otpDoc = await Otp.findOneAndDelete({ phoneNumber, otp }).exec();


    if (otpDoc) {
      // OTP is valid
      return res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('Failed to verify OTP:', err);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
 
});

router.route('/').get((req, res) => {
  User.find()
    .then(User => res.status(200).json(User))
    .catch(err => res.status(500).json('Error: ' + err));
});



const validateLoginUserInput = require("../validation/login_user");




  router.post('/login', async (req, res) => {

      // Form validation
      console.log('Request Body:', req.body);
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


  router.post('/loginPhone', async (req, res) => {

    // Form validation
    console.log('Request Body:', req.body);


  const { phoneNumber, phonePassword } = req.body;

  

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return res.status(401).json({ message: 'Invalid identifiant or password' });
  }

  const isPasswordCorrect = await user.comparePhonePassword(phonePassword);

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Invalid identifiant or password' });
  }

  
 
  token = user.generateToken();
  res.json({ user,token });
});

  router.post('/signup', async (req, res) => {
    try {
      const { userName, identifiant, password, phoneNumber, image, phonePassword } = req.body;
      // Check if the identifiant already exists
      const existingUser = await User.findOne({ identifiant });
      if (existingUser) {
        return res.status(400).json({ message: 'Identifiant already exists' });
      }
  
      // Create a new user
      const user = new User({ userName, identifiant, password, phoneNumber, image, phonePassword });
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


  router.put('/Update/:id',async (req, res) => {
    const { id } = req.params;
    const { userName, identifiant,  oldPassword, newPassword, phoneNumber, phonePassword } = req.body;
  
    try {
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid  password' });
    }

      
  
      // Mettez à jour les champs nécessaires
      user.userName = userName;
      user.identifiant = identifiant;
      user.password = newPassword;
      user.phoneNumber = phoneNumber;
      user.phonePassword = phonePassword;
  
      await user.save();
  
      res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user });
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de l\'utilisateur', error });
    }
  });
  

  module.exports = router;
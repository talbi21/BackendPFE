const router = require('express').Router();
let User = require('../models/User');
const multer = require('multer');

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
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

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
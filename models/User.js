const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String
  },
  identifiant: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: false,
    trim: true,
    minlength: 3
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  phonePassword: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  image: {
    type: String
  },
  firstConnect: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.comparePhonePassword = async function (phonePassword) {
  return await bcrypt.compare(phonePassword, this.phonePassword);
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    { id: this._id, identifiant: this.identifiant },
    "secret",
    { expiresIn: '24h' }
  );
  return token;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') && !this.isModified('phonePassword')) {
    return next();
  }
  const salt1 = await bcrypt.genSalt(10);
  const salt2 = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt1);
  this.phonePassword = await bcrypt.hash(this.phonePassword, salt2);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
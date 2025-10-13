const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends of a string
    minlength: 3, // Minimum length of 3 characters
  },
  profile:String,
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // Converts email to lowercase
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ], // Email format validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum length of 6 characters
  },
  phone: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Sets default value to current date/time
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

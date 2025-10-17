const mongoose = require("mongoose");

const properitySchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends of a string
    minlength: 3, // Minimum length of 3 characters
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  tokenId: { type: String, default: null },
  isListed: {
    type: Boolean,
    default: false,
  },
  status: { type: String, default: "Pending" },
  createdAt: {
    type: Date,
    default: Date.now, // Sets default value to current date/time
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

properitySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Properity = mongoose.model("Properity", properitySchema);

module.exports = Properity;

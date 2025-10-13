const mongoose = require("mongoose");

const properitySchema = new mongoose.Schema({
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
  owner: {
    type: String,
    required: true,
  },
  isListed: {
    type: Boolean,
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

properitySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Properity = mongoose.model("Properity", properitySchema);

module.exports = Properity;

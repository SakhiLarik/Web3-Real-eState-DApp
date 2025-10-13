const mongoose = require("mongoose");

const imagesSchema = new mongoose.Schema({
  properity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Properity',
    required: true
  },
  is_thumbnail: {
    type: Boolean
  },
  image: {
    type: String,
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

imagesSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Images = mongoose.model("Images", imagesSchema);

module.exports = Images;

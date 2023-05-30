const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product Name is required"],
    trim: true,
    maxlength: [120, "Product name should not be more than 120 characters"],
  },
  price: {
    type: Number,
    required: [true, "please provide product price"],
    maxlength: [5, "Product price should not be more than 5 digit"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],

  category: {
    type: String,
    required: [
      true,
      "Please select category from shortsleeves, longsleves, sweatshirts, hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshort", "hoodies"],
      message:
        "Please select category ONLY from short-sleeves, long-sleves, sweat-shirts, hoodies",
    },
  },
  brand: {
    type: String,
    required: [true, "Please add a brand for clothing"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    // total number of reviews added to this product
    type: Number,
    default: 0,
  },
  reviews: [
    {
      // who is the user who has added the review
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],

  user: {
    // who is adding this product like admin, manager...
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);

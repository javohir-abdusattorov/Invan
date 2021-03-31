const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Iltimos emailni kiriting"],
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        "Пожальюста введите корректный Email",
      ],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Iltimos ismingizni kiritng"],
    },
    password: {
      type: String,
      required: [true, "Iltimos parolni kiriting"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      default: "seller",
      enum: ["admin", "seller"],
    },
    shopName: {
      type: String,
      unique: [true, "Bunday nomli sotuvchi mavjud"],
    },
    products: [
      {
        title: { type: String },
        SKU: { type: String },
        qty: { type: Number, min: 0 },
        variant: { type: mongoose.Schema.Types.ObjectId },
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hashing password with bcrypt
Schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign & Get JWT token
Schema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password with hashed password in database
Schema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
Schema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", Schema);

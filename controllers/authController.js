const path = require('path');
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/userModel');
const { uploadUserImage } = require('../utils/uploadImages');
const { redirectSellerProducts } = require("../utils/updateProduct");
const { validateModelID } = require("../utils/validation");
const sendEmail = require('../utils/sendEmail');

const all = async() => {
  let gg = await User.find()
  console.log(gg);
}

// @desc      Register user
// @route     GET /api/v1/auth/all-seller
// @access    Private (Admin only)
exports.allSeller = asyncHandler(async (req, res, next)=>{
  let sellers = await User.find({ role: "seller" })

  res.status(200).json({
    success: true,
    data: sellers
  });
});

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Private (Admin only)
exports.register = asyncHandler(async (req, res, next)=>{
  const { 
    email, 
    name, 
    password,
    shopName,
  } = req.body;

  // Create user
  const user = await User.create({
    email, 
    name,
    password, 
    shopName,
  });

  res.status(200).json({
    success: true
  });
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next)=>{
  const { email, password } = req.body;

  // Validate email & password
  if(!email || !password){
    return next(new ErrorResponse('Iltimos malumotlarni toliq kiriting!', 400));
  }

  //Check for the user
  const user = await User.findOne({ email }).select('+password');

  if(!user) {
    return next(new ErrorResponse('Notogri malumotlar', 401));
  }

  // Check passwords
  const isMatch = await user.matchPassword(password);

  if(!isMatch){
    return next(new ErrorResponse('Notogri malumotlar', 401));
  }
  sendTokenResponse(user, 200, res);
});

// @desc      Get authorized user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next)=>{
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Edit seller
// @route     PUT /api/v1/auth/edit-seller/:id
// @access    Private (Seller only)
exports.editSeller = asyncHandler(async (req, res, next)=>{
  const {
    email, 
    name,
    shopName,
  } = req.body;

  await validateModelID(req.params.id, User, next);

  let updatedSeller = await User.findOneAndUpdate(
    { _id: req.params.id }, 
    {
      email,
      name,
      shopName
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedSeller
  });
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.fortgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if(!user){
    return next(new ErrorResponse(`Bunday foydalanuvchi mavjud emas`, 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `Вы получили эту сообщения так как вы или кто-то хотели восстановить пароль
    на ваш аккаунт. Если это были не вы просто игнорьте сообщения. Ну если это были вы
    переходите по ссылке ниже чтобы восстановит новый пароль \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Parolni qayta tiklash',
      message
    });

    res.status(200).json({ success: true, data: 'Email yuborildi' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({validateBeforeSave: false});

    return next(new ErrorResponse(`Email malum bir sabablarga kora yuborilmadi`, 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if(!user){
    return next(new ErrorResponse(`Invalid token`, 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Update a password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if(!(await user.matchPassword(req.body.currentPassword))){
    return next(new ErrorResponse('Parol notogri', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Delete product
// @route     DELETE /api/v1/auth/delete-seller/:id
// @access    Private (Admin only)
exports.deleteSeller = asyncHandler(async (req, res, next) => {
  let seller = await validateModelID(req.params.id, User, next);
  await User.deleteOne({ _id: req.params.id });
  await redirectSellerProducts(seller);

  res.status(200).json({
    success: true,
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  
  // Create token
  const token = user.getSignedJwtToken();
  let role = user.role;

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      role
    });
}
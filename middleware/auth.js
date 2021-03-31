const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/userModel');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
  } 
  // else if (req.cookies.token){
  //   token = req.cookies.token;
  // }

  //Make sure token exists
  if(!token){
    return next(new ErrorResponse(`Avtorizatsiya yo'q`, 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse(`Avtorizatsiya yo'q`, 401));
  }
});

// Grant access for specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new ErrorResponse(`Rol ${req.user.role} bu route'ga kirishi mumkn emas`, 403));
    }
    next();
  };
};
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Variant = require("../models/variantModel");
const Order = require("../models/orderModel");
const { validateModelID } = require("../utils/validation");
const { updateVariantReminder } = require("../utils/updateProduct");

// @desc      Get all orders
// @route     GET /api/v1/orders/all
// @access    Public
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Create order
// @route     POST /api/v1/orders/create
// @access    Private (Seller only)
exports.addNewOrder = asyncHandler(async (req, res, next) => {
	const {
    customer,
    orderItems,
  } = req.body;

  if (!orderItems.length)
    return next(new ErrorResponse("Notogri malumotlar", 401));

 	// Correcting data
 	let totalPrice = 0
  for (let i = 0; i < orderItems.length; i++) {
  	if (!orderItems[i].qty || !orderItems[i].variant)
  		return next(new ErrorResponse("Notogri malumotlar", 401));

  	let variant = await validateModelID(orderItems[i].variant, Variant, next);
  	let product = await Product.findById(variant.product)

  	if (variant.inStock < orderItems[i].qty)
  		return next(new ErrorResponse("Tovar yetmaydi!", 401));

  	variant.inStock -= orderItems[i].qty
    variant.sold += orderItems[i].qty
    variant.reminder = updateVariantReminder(variant)
  	await variant.save()

    if (variant.valute == "uzs") variant.price = variant.price / process.env.USD_VALUTE

    let variantPrice = variant.price * orderItems[i].qty
    let price = variant.discount ? parseInt(variantPrice - ((variantPrice / 100) * variant.discount)) : variantPrice

  	orderItems[i]._id = undefined
  	orderItems[i].title = product.title
  	orderItems[i].price = price
  	totalPrice += price
  }

  // Create order
  const newOrder = await Order.create({
  	seller: req.user._id,
    customer,
    orderItems,
    totalPrice
  })

  res.status(200).json({
    success: true,
    data: newOrder,
  });
});
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Variant = require('../models/variantModel');
const { validateModelID } = require("../utils/validation");
const { createVariants } = require("../utils/updateProduct");

// @desc      Get all variants
// @route     GET /api/v1/variants/all
// @access    Public
exports.getAllVariants = asyncHandler(async (req, res, next)=>{
	res.status(200).json(res.advancedResults);
})

// @desc      Add variant to product
// @route     PUT /api/v1/variants/create/:id
// @access    Private (Admin only)
exports.addVariantToProduct = asyncHandler(async (req, res, next) => {
  const { variant, option } = req.body
  const product = await validateModelID(req.params.id, Product, next);
  const newVariant = await createVariants(
    [variant],
    [option],
    product._id,
    next
  );

  res.status(200).json({
    success: true,
    data: newVariant,
  });
});

// @desc      Edit product's original varinat
// @route     PUT /api/v1/variants/edit-original/:id
// @access    Private (Admin only)
exports.editOriginalVariant = asyncHandler(async (req, res, next) => {
  const product = await validateModelID(req.params.id, Product, next);
  const variantField = ["cost", "price", "valute", "inStock", "discount", "yellowNorm", "redNorm"];

  let updatingObj = {};
  for (let i = 0; i < productField.length; i++) {
    if (productField[i] in req.body) {
      updatingObj[productField[i]] = req.body[productField[i]];
    }
  }

  const updatedVariant = await Variant.findOneAndUpdate(
    { product: product._id, type: 'original' },
    updatingObj,
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedVariant,
  });
});

// @desc      Edit product's original varinat
// @route     PUT /api/v1/variants/edit/:productID/:variantID
// @access    Private (Admin only)
exports.editProductVariant = asyncHandler(async (req, res, next) => {
  await validateModelID(req.params.variantID, Variant, next);
  const product = await validateModelID(req.params.productID, Product, next);
  const variantField = ["cost", "price", "valute", "inStock", "discount", "yellowNorm", "redNorm"];

  let updatingObj = {};
  for (let i = 0; i < productField.length; i++) {
    if (productField[i] in req.body) {
      updatingObj[productField[i]] = req.body[productField[i]];
    }
  }

  const updatedVariant = await Variant.findOneAndUpdate(
    { product: product._id, type: 'other', _id: req.params.variantID },
    updatingObj,
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedVariant,
  });
});

// @desc      Distribute products
// @route     PUT /api/v1/variants/distribute
// @access    Private (Admin only)
exports.distributeVariants = asyncHandler(async (req, res, next) => {
  const { variants, seller } = req.body
  if (!variants || !seller) return next(new ErrorResponse("Notogri malumotlar!", 401));
  if (!variants.length) return next(new ErrorResponse("Notogri malumotlar!", 401));

  for (let i = 0; i < variants.length; i++) {
    let obj = variants[i]
    if (!obj.qty || obj.qty < 1) return next(new ErrorResponse("Notogri malumotlar!", 401));

    // Validation
    let variant = await validateModelID(obj._id, Variant, next);
    let product = await Product.findById(variant.product)
    if (variant.inStock < obj.qty) return next(new ErrorResponse("Tovar yetmaydi!", 401));

    // Update product
    variant.inStock -= obj.qty
    await variant.save()

    // Update seller
    await validateModelID(seller, User, next);
    let updatedSeller = await User.findOne({ _id: seller, role: 'seller' })
    if (!updatedSeller) return next(new ErrorResponse("Error", 401));

    updatedSeller.products.push({
      title: product.title,
      SKU: product.SKU,
      qty: obj.qty,
      variant: variant._id
    })
    await updatedSeller.save() 
  }

  res.status(200).json({
    success: true,
  });
});

// @desc      Redirect products
// @route     PUT /api/v1/variants/redirect
// @access    Private (Admin only)
exports.redirectVariants = asyncHandler(async (req, res, next) => {
  let { variants, seller } = req.body
  seller = await User.findById(seller) 
  if (!seller.products.length) return next(new ErrorResponse("Bu sotuvchi emas!", 401));

  for (let i = 0; i < variants.length; i++) {
    let body = variants[i]
    const variantID = body._id
    const qty = body.qty

    let sellerVariant = seller.products.find(product => product.variant.toString() === variantID)
    if (!sellerVariant) return next(new ErrorResponse("Tovar yetmaydi!", 401));
    let variantIndex = seller.products.findIndex(product => product.variant.toString() === variantID)

    if (sellerVariant && variantIndex > -1) {
      if (qty > sellerVariant.qty) return next(new ErrorResponse("Tovar yetmaydi!", 401));
      if (qty === sellerVariant.qty) {
        seller.products.splice(variantIndex, 1)
      } else if (qty < sellerVariant.qty) {
        seller.products[variantIndex].qty -= qty
      }

      let updatedVariant = await Variant.findOneAndUpdate(
        { _id: variantID },
        { $inc: { inStock: qty } },
        { new: true }
      );
    }
  }
  let updatedSeller = await seller.save()

  res.status(200).json({
    success: true,
    data: updatedSeller
  });
});

// @desc      Delete variant
// @route     DELETE /api/v1/variants/delete/:productID/:variantID
// @access    Private (Admin only)
exports.deleteVariant = asyncHandler(async (req, res, next) => {
  let product = await validateModelID(req.params.productID, Product, next);
  let variant = await validateModelID(req.params.variantID, Variant, next);
  let optionIndex = product.options.findIndex(option => option.variant === variant._id)
  product.options.splice(optionIndex, 1)
  await Variant.deleteOne({ product: product._id, type: 'other', _id: variant._id });
  await product.save()

  res.status(200).json({
    success: true,
  });
});
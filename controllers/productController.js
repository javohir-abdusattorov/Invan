const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Variant = require("../models/variantModel");
const { uploadProductImage, deleteImages } = require("../utils/uploadImages");
const productRepresentation = JSON.parse(process.env.PRODUCT_REPRESENTATION);
const { validateModelID } = require("../utils/validation");
const {
  createOriginalVariant,
  createVariants,
  deleteProductVariants,
} = require("../utils/updateProduct");

const generateSKU = () => {
  const ms = new Date().getTime();
  return `${Math.floor(Math.random() * (Math.floor(9) - Math.ceil(0))) + Math.ceil(0)}${ms.toString().slice(-6)}`;
};

// @desc      Get all products
// @route     GET /api/v1/products/all
// @access    Public
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  let products = await Product.find()

  for (let i = 0; i < products.length; i++) {
    let productOriginalIndex = products[i].options.findIndex(option => option.key === "Option" && option.value === "orginal")
    let productOriginal = await Variant.findById(products[i].options[productOriginalIndex].variant)
    products[i].options[productOriginalIndex].variant = productOriginal
  }

  res.status(200).json({
    data: products
  });
});

// @desc      Search products
// @route     GET /api/v1/products/search?q
// @access    Public
exports.searchProducts = asyncHandler(async (req, res, next) => {
  const search = req.query.q;
  if (search === "") {
    res.send([]);
    return;
  }
  Product.searchPartial(search, function (err, data) {
    if (err) {
      console.log(err);
    }
    res.status(200).json(data);
  });
});

// @desc      Create product
// @route     POST /api/v1/products/create
// @access    Private (Admin only)
exports.addNewProduct = asyncHandler(async (req, res, next) => {
  const {
    title,
    representation,
    options,
    variants,
    soldBy,
    category,
  } = req.body;

  if (options.length !== variants.length)
    return next(new ErrorResponse("Notogri malumotlar", 401));
  const productCategory = await validateModelID(category, Category, next);
  const SKU = generateSKU();
  let image;
  let color;

  if (representation == productRepresentation[1]) {
    if (!req.files || !req.files.image)
      return next(new ErrorResponse("Rasm yoq!", 401));
    image = uploadProductImage(req.files.image, next);
  } else {
    if (!req.body.color)
      return next(new ErrorResponse("Notogri malumotlar!", 401));
    color = req.body.color;
  }

  // Create product
  const product = await Product.create({
    title,
    representation,
    SKU,
    image,
    color,
    options: [],
    category: {
      name: productCategory.name,
      category: productCategory._id,
    },
    soldBy,
  });

  await createOriginalVariant(req.body, product._id, next);
  let updatedProduct = await createVariants(
    variants,
    options,
    product._id,
    next
  );

  res.status(200).json({
    success: true,
    data: updatedProduct,
  });
});

// @desc      Edit product
// @route     PUT /api/v1/products/edit/:id
// @access    Private (Admin only)
exports.editProduct = asyncHandler(async (req, res, next) => {
  let product = await validateModelID(req.params.id, Product, next);
  const productField = ["title", "representation", "soldBy"];

  let updatingObj = {};
  for (let i = 0; i < productField.length; i++) {
    if (productField[i] in req.body) {
      updatingObj[productField[i]] = req.body[productField[i]];
    }
  }

  if (req.body.representation) {
    if (product.representation !== req.body.representation) {
      if (req.body.representation == productRepresentation[1]) {
        if (!req.files || !req.files.image)
          return next(new ErrorResponse("Rasm yoq!", 401));
        const image = uploadProductImage(req.files.image, next);
        deleteImages([product.image]);
        updatingObj["image"] = image;
        updatingObj["color"] = undefined
      } else {
        if (!req.files.color)
          return next(new ErrorResponse("Notogri malumotlar!", 401));
        const color = req.body.color;
        updatingObj["color"] = color;
        updatingObj["image"] = undefined
      }
    }
  }

  if (req.body.category) {
    if (product.category !== req.body.category) {
      const productCategory = await validateModelID(category, Category, next);
      updatingObj[category] = {
        name: productCategory.name,
        category: productCategory._id,
      };
    }
  }

  let updatedProduct = await Product.findOneAndUpdate(
    { _id: req.params.id },
    updatingObj,
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedProduct,
  });
});

// @desc      Delete product
// @route     DELETE /api/v1/products/delete/:id
// @access    Private (Admin only)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  let product = await validateModelID(req.params.id, Product, next);
  await Product.deleteOne({ _id: req.params.id });
  await deleteProductVariants(product._id);
  if (product.image) deleteImages([product.image]);

  res.status(200).json({
    success: true,
  });
});
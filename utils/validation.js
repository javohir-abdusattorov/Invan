const ErrorResponse = require('../utils/errorResponse');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

exports.validateProduct = async (req, next) => {
  const { category } = req.body;
  let productCategory = await Category.findById(category);
  if (!productCategory) return next(new ErrorResponse('Такая категория не найдено!', 400));

  if (!req.files) return next(new ErrorResponse('Изображений должно быть как минимум две и не больше восьми! ', 400));

  let totalImages = req.files.images.length;
  if (totalImages <= process.env.MIN_IMAGE_PER_PRODUCT || totalImages > process.env.MAX_IMAGE_PER_PRODUCT)
    return next(new ErrorResponse('Изображений должно быть как минимум две и не больше восьми! ', 400));

  return { productCategory, totalImages };
};

exports.validateModelID = async (id, Model, next) => {
  if(id.length !== 24) return next(new ErrorResponse('Некорректные данные', 401));
  let item = await Model.findById(id);
  if (!item) return next(new ErrorResponse('Не найдено', 404));
  return item;
};

exports.validateEditingProductCategory = async (req, next) => {
  const { category } = req.body;
  let productCategory = await Category.findById(category);
  if (!productCategory) return next(new ErrorResponse('Такая категория не найдено!', 400));

  return productCategory;
};

exports.validateEditingProductImages = (req, next) => {
  let totalImages = req.files.images.length;
  if (totalImages <= process.env.MIN_IMAGE_PER_PRODUCT || totalImages > process.env.MAX_IMAGE_PER_PRODUCT)
    return next(new ErrorResponse('Изображений должно быть больше двух и меньше восьми! ', 400));

  return totalImages;
};
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Category = require('../models/categoryModel');
const { validateModelID } = require('../utils/validation');

// @desc      Create main category
// @route     POST /api/v1/category/all
// @access    Public
exports.getAllCategory = asyncHandler(async (req, res, next)=>{
	res.status(200).json(res.advancedResults);
})

// @desc      Create main category
// @route     POST /api/v1/category/create
// @access    Private (Admin only)
exports.addCategory = asyncHandler(async (req, res, next)=>{
  const { name } = req.body;

  const category = await Category.create({
    name
  });

  res.status(201).json({
    success: true,
    data: category
  });
})
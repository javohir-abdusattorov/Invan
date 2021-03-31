const { Router } = require('express');
const router = Router();
const Category = require('../models/categoryModel');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const {
	getAllCategory,
  addCategory,
} = require('../controllers/categoryController');

router.get('/all', advancedResults(Category), getAllCategory);
router.post('/create', protect, authorize('admin'), addCategory);

module.exports = router;
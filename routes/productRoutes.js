const { Router } = require('express');
const router = Router();
const Product = require('../models/productModel');
const { 
  getAllProducts,
  addNewProduct,
  deleteProduct,
  editProduct,
  searchProducts,
} = require('../controllers/productController');

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.get('/all', advancedResults(Product), getAllProducts);
router.get('/search', searchProducts);
router.post('/create', protect, authorize('fabric'), addNewProduct);
router.put('/edit/:id', protect, authorize('admin'), editProduct);
router.delete('/delete/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
const { Router } = require('express');
const router = Router();
const Order = require('../models/orderModel');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const {
	getAllOrders,
  addNewOrder,
} = require('../controllers/orderController');

router.get('/all', advancedResults(Order), getAllOrders);
router.post('/create', protect, authorize('seller'), addNewOrder);

module.exports = router;
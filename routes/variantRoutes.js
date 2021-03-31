const { Router } = require('express');
const router = Router();
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const Variant = require('../models/variantModel');
const { 
  getAllVariants,
  addVariantToProduct,
  editOriginalVariant,
  editProductVariant,
  distributeVariants,
  redirectVariants,
  deleteVariant,
} = require('../controllers/variantController');

router.get('/all', advancedResults(Variant), getAllVariants);
router.post('/create/:id', protect, authorize('admin'), addVariantToProduct);
router.put('/edit-original/:id', protect, authorize('admin'), editOriginalVariant);
router.put('/edit/:productID/:variantID', protect, authorize('admin'), editProductVariant);
router.put('/distribute', protect, authorize('admin'), distributeVariants);
router.put('/redirect', protect, authorize('admin'), redirectVariants);
router.delete('/delete/:productID/:variantID', protect, authorize('admin'), deleteVariant);

module.exports = router;
const { Router } = require('express');
const {
	allSeller,
  register,
  login,
  getMe,
  editSeller,
  updateDetails,
  updatePassword,
  resetPassword,
  fortgotPassword,
  deleteSeller,
} = require('../controllers/authController');
const router = Router();
const { protect, authorize } = require('../middleware/auth');

router.get('/all-seller', protect, authorize('admin'), allSeller);
router.post('/register', protect, authorize('admin'), register);
router.post('/editseller/:id', protect, authorize('admin'), editSeller);
router.put('/update-password', protect, updatePassword);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', fortgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.delete('/delete-seller/:id', protect, authorize('admin'), deleteSeller);

module.exports = router;
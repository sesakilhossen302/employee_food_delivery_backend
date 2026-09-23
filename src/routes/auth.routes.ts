import { Router } from 'express';
import {
  login,
  register,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  guestCheckout,
  getMe,
  updateProfile,
  addSavedAddress,
  getSavedAddresses,
} from '../controllers/auth.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/guest-checkout', guestCheckout);
router.get('/me', authenticate, getMe);
router.patch('/me', optionalAuth, updateProfile);
router.patch('/profile', optionalAuth, updateProfile);
router.post('/address', authenticate, addSavedAddress);
router.get('/address', authenticate, getSavedAddresses);

export default router;

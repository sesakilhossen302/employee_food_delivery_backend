import { Router } from 'express';
import {
  login,
  register,
  guestCheckout,
  getMe,
  addSavedAddress,
  getSavedAddresses,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest-checkout', guestCheckout);
router.get('/me', authenticate, getMe);
router.post('/address', authenticate, addSavedAddress);
router.get('/address', authenticate, getSavedAddresses);

export default router;
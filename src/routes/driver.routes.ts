import { Router } from 'express';
import {
  getDriverActiveOrders,
  pickupOrder,
  completeOrder,
  getDriverStats,
} from '../controllers/driver.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(optionalAuth);

router.get('/active-orders', getDriverActiveOrders);
router.patch('/orders/:id/pickup', pickupOrder);
router.patch('/orders/:id/complete', completeOrder);
router.get('/stats', getDriverStats);

export default router;

import { Router } from 'express';
import {
  getDriverActiveOrders,
  pickupOrder,
  completeOrder,
  getDriverStats,
} from '../controllers/driver.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('driver', 'admin', 'staff'));

router.get('/active-orders', getDriverActiveOrders);
router.patch('/orders/:id/pickup', pickupOrder);
router.patch('/orders/:id/complete', completeOrder);
router.get('/stats', getDriverStats);

export default router;
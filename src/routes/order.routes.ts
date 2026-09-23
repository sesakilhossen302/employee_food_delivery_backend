import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  acceptOrder,
  assignDriver,
  getOrderPackingSlipPDF,
  getOrderTracking,
} from '../controllers/order.controller.js';

const router = Router();
router.post('/', createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id/accept', acceptOrder);
router.patch('/:id/assign-driver', assignDriver);
router.get('/:id/packing-slip', getOrderPackingSlipPDF);
router.get('/:id/tracking', getOrderTracking);

export default router;
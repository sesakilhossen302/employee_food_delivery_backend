import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  assignDriver,
  getOrderPackingSlipPDF,
} from '../controllers/order.controller.js';

const router = Router();
router.post('/', createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/assign-driver', assignDriver);
router.get('/:id/packing-slip', getOrderPackingSlipPDF);

export default router;
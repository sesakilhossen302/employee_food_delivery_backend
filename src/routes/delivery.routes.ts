import { Router } from 'express';
import { checkDeliveryArea, calculateOrderPricing } from '../controllers/delivery.controller.js';

const router = Router();

router.post('/check-area', checkDeliveryArea);
router.post('/calculate-pricing', calculateOrderPricing);

export default router;
import { Router } from 'express';
import { getProducts, toggleStock, createProduct } from '../controllers/product.controller.js';

const router = Router();
router.get('/', getProducts);
router.post('/', createProduct);
router.patch('/:id/toggle-stock', toggleStock);

export default router;
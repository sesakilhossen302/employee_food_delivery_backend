import { Router } from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/category.controller.js';

const router = Router();
router.get('/', getCategories);
router.post('/', createCategory);

router.delete('/:id', deleteCategory);

export default router;
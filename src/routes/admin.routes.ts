import { Router } from 'express';
import { getDashboardStats, getDriversList } from '../controllers/admin.controller.js';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/drivers', getDriversList);

export default router;
import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, getNotifications);
router.patch('/read-all', optionalAuth, markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;

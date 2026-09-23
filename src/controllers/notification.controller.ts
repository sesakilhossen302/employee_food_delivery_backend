import { Request, Response } from 'express';
import { Notification } from '../models/Notification.model.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const filter: any = {};
    if (userId) {
      filter.$or = [{ userId }, { userId: null }, { userId: { $exists: false } }];
    }

    let notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    
    // If no notifications yet, provide default helpful system notifications
    if (notifications.length === 0) {
      notifications = [
        new Notification({
          title: 'Welcome to Little Arrows Delivery!',
          message: 'Explore our wide selection of cold drinks, snacks, and daily essentials with ultra-fast local delivery.',
          category: 'system',
          isRead: false,
          createdAt: new Date(),
        }),
        new Notification({
          title: 'Cash Payment Only Notice',
          message: 'As per store policy, all deliveries & pickups are hand cash payments. Exact change is appreciated!',
          category: 'promo',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000),
        }),
      ];
    }

    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json({ success: true, data: notif });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const filter: any = {};
    if (userId) filter.userId = userId;

    await Notification.updateMany(filter, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

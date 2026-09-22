import { Request, Response } from 'express';
import { Order } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { User } from '../models/User.model.js';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [orders, products, drivers] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Product.find(),
      User.find({ role: 'driver' }),
    ]);

    const activeOrders = orders.filter((o) => o.status !== 'delivered');
    const deliveredToday = orders.filter((o) => o.status === 'delivered');
    const totalRevenue = deliveredToday.reduce((sum, o) => sum + o.total, 0);
    const outOfStock = products.filter((p) => !p.inStock).length;

    res.json({
      success: true,
      data: {
        activeOrdersCount: activeOrders.length,
        receivedCount: orders.filter((o) => o.status === 'received').length,
        confirmedCount: orders.filter((o) => o.status === 'confirmed').length,
        preparingCount: orders.filter((o) => o.status === 'preparing').length,
        readyForDriverCount: orders.filter((o) => o.status === 'ready_for_driver').length,
        outForDeliveryCount: orders.filter((o) => o.status === 'out_for_delivery').length,
        deliveredTodayCount: deliveredToday.length,
        totalRevenue: +totalRevenue.toFixed(2),
        outOfStockCount: outOfStock,
        totalProducts: products.length,
        activeDriversCount: drivers.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDriversList = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json({ success: true, data: drivers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
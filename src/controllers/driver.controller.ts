import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';

// Get Active Orders for the logged in driver
export const getDriverActiveOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const orders = await Order.find({
      'assignedDriver.id': driverId,
      status: { $in: ['ready_for_driver', 'out_for_delivery'] },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Driver marks order picked up from gas station
export const pickupOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: 'out_for_delivery' },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const io = (req as any).io;
    if (io) {
      io.emit('order_status_updated', order);
      io.to(`order_${id}`).emit('order_status_updated', order);
    }

    res.json({ success: true, message: 'Order marked as Out for Delivery', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Driver marks delivered and confirms cash collected
export const completeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: 'delivered', paymentStatus: 'paid' },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Update driver deliveries count
    if (order.assignedDriver?.id) {
      await User.findByIdAndUpdate(order.assignedDriver.id, {
        $inc: { 'driverDetails.totalDeliveries': 1 },
      });
    }

    const io = (req as any).io;
    if (io) {
      io.emit('order_status_updated', order);
      io.to(`order_${id}`).emit('order_status_updated', order);
    }

    res.json({ success: true, message: 'Order marked Delivered & Cash Collected', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Driver Earnings & Delivery Stats
export const getDriverStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const driver = await User.findById(driverId);
    
    const completedOrders = await Order.find({
      'assignedDriver.id': driverId,
      status: 'delivered',
    });

    const totalCashCollected = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalTips = completedOrders.reduce((sum, o) => sum + o.tip, 0);

    res.json({
      success: true,
      data: {
        completedDeliveries: completedOrders.length,
        totalCashCollected: +totalCashCollected.toFixed(2),
        totalTips: +totalTips.toFixed(2),
        driverDetails: driver?.driverDetails,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
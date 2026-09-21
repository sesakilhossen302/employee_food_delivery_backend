import { Request, Response } from 'express';
import { Order } from '../models/Order.model.js';
import { calculateDeliveryFee } from '../services/delivery.service.js';
import { generateOrderPackingSlipPDF } from '../services/pdf.service.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer, fulfillmentType, items, tip, paymentMethod } = req.body;

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const taxes = +(subtotal * 0.085).toFixed(2);
    const distanceKm = customer.distanceKm || 3;
    const deliveryFee = fulfillmentType === 'delivery' ? await calculateDeliveryFee(distanceKm, subtotal) : 0;
    const tipAmount = tip || 0;
    const total = +(subtotal + taxes + deliveryFee + tipAmount).toFixed(2);

    const orderNumber = `#GS-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await Order.create({
      orderNumber,
      customer,
      fulfillmentType,
      items,
      subtotal,
      taxes,
      deliveryFee,
      tip: tipAmount,
      total,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: 'unpaid',
      status: 'received',
    });

    // Realtime notification
    const io = (req as any).io;
    if (io) {
      io.emit('new_order', order);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === 'delivered' ? { paymentStatus: 'paid' } : {}),
      },
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

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { driverId, driverName, driverPhone } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        assignedDriver: { id: driverId, name: driverName, phone: driverPhone },
        status: 'ready_for_driver',
      },
      { new: true }
    );

    const io = (req as any).io;
    if (io) {
      io.emit('driver_order_assigned', order);
      io.to(`order_${id}`).emit('order_status_updated', order);
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// One-click Printable Order Packing Slip PDF
export const getOrderPackingSlipPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).send('Order not found');
      return;
    }
    generateOrderPackingSlipPDF(order, res);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};
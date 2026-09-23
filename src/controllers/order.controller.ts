import { Request, Response } from 'express';
import { Order } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { Notification } from '../models/Notification.model.js';
import { calculateDeliveryFee } from '../services/delivery.service.js';
import { generateOrderPackingSlipPDF } from '../services/pdf.service.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer, fulfillmentType, items, tip, paymentMethod } = req.body;

    const normalizedCustomer = {
      name: customer?.name || 'Customer',
      phone: customer?.phone || '+1 (555) 000-0000',
      email: customer?.email,
      deliveryAddress: customer?.deliveryAddress || customer?.address || (fulfillmentType === 'pickup' ? 'Store Pickup' : 'Local Address'),
      deliveryInstructions: customer?.deliveryInstructions || customer?.instructions || '',
      distanceKm: customer?.distanceKm || 3,
      lat: customer?.lat,
      lng: customer?.lng,
    };

    const normalizedItems = await Promise.all(
      (items || []).map(async (item: any, idx: number) => {
        const price = +(item.price || 0);
        const qty = +(item.quantity || item.qty || 1);
        let img = item.imageUrl || '';
        if (!img && item.productId && item.productId.match(/^[0-9a-fA-F]{24}$/)) {
          const p = await Product.findById(item.productId).catch(() => null);
          if (p && p.imageUrl) img = p.imageUrl;
        }
        return {
          productId: item.productId || item.id || item._id || `item-${idx + 1}`,
          name: item.name || 'Store Item',
          price,
          quantity: qty,
          sizeOrOption: item.sizeOrOption || item.unit || '',
          totalPrice: +(item.totalPrice || price * qty).toFixed(2),
          imageUrl: img,
        };
      })
    );

    const subtotal = normalizedItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const taxes = +(subtotal * 0.085).toFixed(2);
    const distanceKm = normalizedCustomer.distanceKm || 3;
    const deliveryFee = fulfillmentType === 'delivery' ? await calculateDeliveryFee(distanceKm, subtotal) : 0;
    const tipAmount = tip || 0;
    const total = +(subtotal + taxes + deliveryFee + tipAmount).toFixed(2);

    const orderNumber = `#GS-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await Order.create({
      orderNumber,
      customer: normalizedCustomer,
      fulfillmentType: fulfillmentType || 'delivery',
      items: normalizedItems,
      subtotal,
      taxes,
      deliveryFee,
      tip: tipAmount,
      total,
      paymentMethod: paymentMethod || (fulfillmentType === 'delivery' ? 'cash_on_delivery' : 'cash_at_pickup'),
      paymentStatus: 'unpaid',
      status: 'received',
    });

    // Create persistent notification
    try {
      await Notification.create({
        title: 'Order Placed Successfully',
        message: `Order ${orderNumber} ($${total}) is received by Little Arrows Store.`,
        category: 'order',
        orderId: order._id,
      });
    } catch (e) {
      console.warn('Notification create warning:', e);
    }

    // Realtime notification via Socket.io
    const io = (req as any).io;
    if (io) {
      io.emit('new_order', order);
      // Broadcast to all drivers
      io.emit('new_order_available', order);
      io.emit('notification', {
        title: 'Order Placed Successfully',
        message: `Order ${orderNumber} placed for $${total}.`,
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, customerPhone } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (customerPhone) filter['customer.phone'] = customerPhone;

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

    // Persistent notification for status update
    try {
      const statusTitle = status === 'delivered' ? 'Order Delivered 🎉' : `Order ${status.replace(/_/g, ' ')}`;
      await Notification.create({
        title: statusTitle,
        message: `Order ${order.orderNumber} is now ${status.replace(/_/g, ' ')}.`,
        category: status === 'out_for_delivery' ? 'delivery' : 'order',
        orderId: order._id,
      });
    } catch (e) {
      console.warn('Status notification error:', e);
    }

    const io = (req as any).io;
    if (io) {
      io.emit('order_status_updated', order);
      io.to(`order_${id}`).emit('order_status_updated', order);
      io.emit('notification', {
        title: `Order ${order.orderNumber} Status Updated`,
        message: `Order is now ${status.replace(/_/g, ' ')}.`,
      });
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

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    try {
      await Notification.create({
        title: 'Driver Assigned',
        message: `${driverName} (${driverPhone}) is assigned to deliver order ${order.orderNumber}.`,
        category: 'delivery',
        orderId: order._id,
      });
    } catch (e) {
      console.warn('Assign driver notification error:', e);
    }

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

import { latestDriverLocations } from '../sockets/socket.handler.js';

export const getOrderTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let order = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id.startsWith('#') ? id : `#${id}` });
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id });
    }
    if (!order) {
      order = await Order.findOne().sort({ createdAt: -1 });
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const orderIdStr = order._id.toString();
    const cachedLoc = latestDriverLocations.get(orderIdStr) ||
                      latestDriverLocations.get(order.orderNumber) ||
                      (order.assignedDriver?.id ? latestDriverLocations.get(order.assignedDriver.id.toString()) : null);

    const storeLocation = {
      name: 'Little Arrows Delivery Store',
      lat: 46.8772,
      lng: -96.7898,
      address: 'Little Arrows Delivery Store, 1250 Highway Blvd',
    };

    const customerLocation = {
      name: order.customer?.name || 'Customer',
      address: order.customer?.deliveryAddress || 'Springfield Residential Area',
      lat: 46.8920,
      lng: -96.8050,
    };

    const driverLocation = cachedLoc || {
      lat: order.status === 'delivered' ? customerLocation.lat : 46.8820,
      lng: order.status === 'delivered' ? customerLocation.lng : -96.7940,
      heading: 45,
      timestamp: Date.now(),
    };

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        fulfillmentType: order.fulfillmentType,
        storeLocation,
        customerLocation,
        driverLocation,
        driver: order.assignedDriver || {
          name: 'Delivery Driver',
          phone: '+1 (555) 019-2834',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { driverId, driverName, driverPhone } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.status !== 'received' && order.status !== 'ready_for_driver' && order.status !== 'preparing') {
      res.status(400).json({ success: false, message: 'Order is not available for acceptance' });
      return;
    }

    order.status = 'ready_for_driver';
    order.assignedDriver = {
      id: driverId,
      name: driverName || 'Driver',
      phone: driverPhone || '',
    };
    await order.save();

    const io = (req as any).io;
    if (io) {
      // Notify customer that a driver accepted
      io.to(`order_${id}`).emit('order_status_updated', order);
      io.emit('order_status_updated', order);
      // Remove from available list for other drivers
      io.emit('order_accepted_by_driver', { orderId: id, driverId });
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

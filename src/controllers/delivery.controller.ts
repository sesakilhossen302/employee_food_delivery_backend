import { Request, Response } from 'express';
import { StoreSettings } from '../models/StoreSettings.model.js';
import { calculateDeliveryFee } from '../services/delivery.service.js';

// Check if customer address / postal code / distance is within store delivery area
export const checkDeliveryArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postalCode, distanceKm } = req.body;
    const settings = await StoreSettings.findOne();

    const maxRadius = settings?.maxDeliveryRadiusKm || 20;
    const allowedPostalCodes = settings?.allowedPostalCodes || [];

    let isDeliverable = true;
    let message = 'Your location is within our local delivery area!';

    // Check by Postal Code if provided
    if (postalCode && allowedPostalCodes.length > 0) {
      const match = allowedPostalCodes.some((code) =>
        postalCode.toString().trim().toLowerCase().startsWith(code.trim().toLowerCase())
      );
      if (!match) {
        isDeliverable = false;
        message = 'Sorry, we do not deliver to this postal/zip code yet.';
      }
    }

    // Check by distance
    const dist = distanceKm ? parseFloat(distanceKm) : 3;
    if (dist > maxRadius) {
      isDeliverable = false;
      message = `Sorry, your location (${dist} km) exceeds our maximum delivery radius of ${maxRadius} km.`;
    }

    const estimatedFee = isDeliverable ? await calculateDeliveryFee(dist, 0) : 0;

    res.json({
      success: true,
      data: {
        isDeliverable,
        distanceKm: dist,
        maxRadiusKm: maxRadius,
        estimatedDeliveryMinutes: dist <= 5 ? '15–25 min' : '25–40 min',
        estimatedFee,
        message,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Calculate order pricing preview (Subtotal + Taxes + Tiered Fee + Tip - Discount = Total Cash)
export const calculateOrderPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, distanceKm, fulfillmentType, tip } = req.body;

    const settings = await StoreSettings.findOne();
    const taxRate = (settings?.taxRatePercent || 8.5) / 100;
    const freeThreshold = settings?.freeDeliveryThreshold || 50;

    const subtotal = (items || []).reduce(
      (sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1),
      0
    );

    const taxes = +(subtotal * taxRate).toFixed(2);
    const dist = distanceKm ? parseFloat(distanceKm) : 3;
    
    let deliveryFee = 0;
    let isFreeDelivery = false;

    if (fulfillmentType === 'delivery') {
      if (subtotal >= freeThreshold) {
        deliveryFee = 0;
        isFreeDelivery = true;
      } else {
        deliveryFee = await calculateDeliveryFee(dist, subtotal);
      }
    }

    const tipAmount = tip ? parseFloat(tip) : 0;
    const total = +(subtotal + taxes + deliveryFee + tipAmount).toFixed(2);

    res.json({
      success: true,
      data: {
        subtotal: +subtotal.toFixed(2),
        taxes,
        deliveryFee,
        isFreeDelivery,
        freeDeliveryThreshold: freeThreshold,
        tip: tipAmount,
        total,
        currency: 'USD',
        paymentType: 'Hand Payment (Cash Only)',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
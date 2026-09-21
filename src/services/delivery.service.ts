import { StoreSettings } from '../models/StoreSettings.model.js';

export const calculateDeliveryFee = async (distanceKm: number, subtotal: number): Promise<number> => {
  const settings = await StoreSettings.findOne();
  if (!settings) {
    // Default fallback calculation:
    if (subtotal >= 50) return 0;
    if (distanceKm <= 5) return 3.99;
    if (distanceKm <= 10) return 6.99;
    return 11.99;
  }

  if (subtotal >= settings.freeDeliveryThreshold) {
    return 0; // Free delivery threshold met
  }

  for (const tier of settings.deliveryTiers) {
    if (distanceKm >= tier.minKm && distanceKm <= tier.maxKm) {
      return tier.fee;
    }
  }

  return 5.00; // standard fallback
};
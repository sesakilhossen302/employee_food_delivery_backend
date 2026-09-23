import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreSettings extends Document {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  enableStorePickup: boolean;
  enablePayAtDoor: boolean;
  taxRatePercent: number;
  maxDeliveryRadiusKm: number;
  freeDeliveryThreshold: number;
  deliveryTiers: Array<{
    minKm: number;
    maxKm: number;
    fee: number;
  }>;
  allowedPostalCodes: string[];
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: { type: String, default: 'Little Arrows Delivery App' },
    storePhone: { type: String, default: '+1 (555) 019-2834' },
    storeEmail: { type: String, default: 'orders@littlearrowsdelivery.com' },
    storeAddress: { type: String, default: '123 Highway 10, Local Town' },
    enableStorePickup: { type: Boolean, default: true },
    enablePayAtDoor: { type: Boolean, default: true },
    taxRatePercent: { type: Number, default: 8.5 },
    maxDeliveryRadiusKm: { type: Number, default: 20 },
    freeDeliveryThreshold: { type: Number, default: 50 },
    deliveryTiers: [
      {
        minKm: { type: Number },
        maxKm: { type: Number },
        fee: { type: Number },
      },
    ],
    allowedPostalCodes: [{ type: String }],
  },
  { timestamps: true }
);

export const StoreSettings = mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);

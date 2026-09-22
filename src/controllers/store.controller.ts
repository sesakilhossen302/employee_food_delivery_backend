import { Request, Response } from 'express';
import { StoreSettings } from '../models/StoreSettings.model.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { Banner } from '../models/Banner.model.js';

export const getHomeScreenData = async (req: Request, res: Response): Promise<void> => {
  try {
    const [settings, categories, banners, featuredProducts, popularProducts] = await Promise.all([
      StoreSettings.findOne(),
      Category.find({ isActive: true }).sort({ order: 1 }),
      Banner.find({ isActive: true }).sort({ order: 1 }),
      Product.find({ isFeatured: true, inStock: true }).limit(8),
      Product.find({ isPopular: true, inStock: true }).limit(8),
    ]);

    res.json({
      success: true,
      data: {
        storeInfo: {
          name: settings?.storeName || 'Dakota Gas Station & Convenience Store',
          address: settings?.storeAddress || '123 Highway 10, Local Town',
          phone: settings?.storePhone || '+1 (555) 019-2834',
          isOpen: true,
          enableStorePickup: settings?.enableStorePickup ?? true,
          enablePayAtDoor: settings?.enablePayAtDoor ?? true,
          freeDeliveryThreshold: settings?.freeDeliveryThreshold || 50,
        },
        banners,
        categories,
        featuredProducts,
        popularProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStoreSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStoreSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
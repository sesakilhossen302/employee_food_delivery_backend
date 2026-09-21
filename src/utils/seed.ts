import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { User } from '../models/User.model.js';
import { StoreSettings } from '../models/StoreSettings.model.js';

const seed = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('🌱 Connected to MongoDB for Seeding...');

    // Clear old data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await StoreSettings.deleteMany({});

    // Seed Categories
    const categories = [
      { name: 'Drinks & Pop', iconEmoji: '🥤', order: 1 },
      { name: 'Energy Drinks', iconEmoji: '⚡', order: 2 },
      { name: 'Snacks & Chips', iconEmoji: '🍟', order: 3 },
      { name: 'Candy & Chocolate', iconEmoji: '🍫', order: 4 },
      { name: 'Ice Cream', iconEmoji: '🍦', order: 5 },
      { name: 'Automotive & Fluids', iconEmoji: '🚗', order: 6 },
      { name: 'Ice & Coolers', iconEmoji: '🧊', order: 7 },
      { name: 'Firewood & Camp', iconEmoji: '🪵', order: 8 },
      { name: 'Grocery & Essentials', iconEmoji: '🛒', order: 9 },
    ];
    await Category.insertMany(categories);
    console.log('✅ Categories seeded');

    // Seed Products
    const products = [
      {
        name: 'Red Bull Energy Drink',
        category: 'Energy Drinks',
        price: 3.99,
        salePrice: 3.49,
        unit: '12 fl oz',
        imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&auto=format&fit=crop&q=60',
        description: 'Vitalizes body and mind.',
        inStock: true,
      },
      {
        name: 'Coca-Cola Classic Can',
        category: 'Drinks & Pop',
        price: 1.99,
        unit: '355ml',
        imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&auto=format&fit=crop&q=60',
        description: 'Chilled refreshing classic soda.',
        inStock: true,
      },
      {
        name: 'Doritos Nacho Cheese',
        category: 'Snacks & Chips',
        price: 4.79,
        salePrice: 4.29,
        unit: '9.25 oz bag',
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60',
        description: 'Bold nacho cheese tortilla chips.',
        inStock: true,
      },
      {
        name: 'Seasoned Firewood Bundle',
        category: 'Firewood & Camp',
        price: 8.99,
        unit: 'Bundle (.75 cu ft)',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60',
        description: 'Dry local firewood bundle.',
        inStock: true,
      },
      {
        name: '-20°F Windshield Washer Fluid',
        category: 'Automotive & Fluids',
        price: 4.49,
        unit: '1 Gallon',
        imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60',
        description: 'All season anti-freeze glass cleaner.',
        inStock: true,
      },
    ];
    await Product.insertMany(products);
    console.log('✅ Products seeded');

    // Seed Store Settings
    await StoreSettings.create({
      storeName: 'Dakota Gas Station & Convenience Store',
      storePhone: '+1 (555) 019-2834',
      storeEmail: 'orders@dakotagasstore.com',
      storeAddress: '123 Highway 10, Local Town',
      enableStorePickup: true,
      enablePayAtDoor: true,
      taxRatePercent: 8.5,
      deliveryTiers: [
        { minKm: 0, maxKm: 5, fee: 3.99 },
        { minKm: 5, maxKm: 10, fee: 6.99 },
        { minKm: 10, maxKm: 20, fee: 11.99 },
      ],
      freeDeliveryThreshold: 50,
    });
    console.log('✅ Store settings seeded');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();